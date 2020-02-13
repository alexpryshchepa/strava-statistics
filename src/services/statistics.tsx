import { Activity, Activities, ActivityType } from 'api/types';
import { sum, divide } from 'lodash';
import {
  Option,
  none,
  some,
  fromNullable,
  getEq,
  isNone,
} from 'fp-ts/lib/Option';
import * as ls from 'local-storage';
import { eqString } from 'fp-ts/lib/Eq';
import { isValidDate } from 'utils/index';

type TimeOfDay = 'morning' | 'day' | 'evening';

type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

type SingleActivity = {
  id: number;
  title: string;
  distance: number;
  elevation: number;
  time: number;
  speed: number;
  kudos: number;
};

const initialSingleActivity: SingleActivity = {
  id: 0,
  title: '',
  distance: 0,
  elevation: 0,
  time: 0,
  speed: 0,
  kudos: 0,
};

interface Others {
  name: string;
  activities: number;
  distance: number;
  elevation: number;
  time: number;
  kudos: number;
  farthest: SingleActivity;
  longest: SingleActivity;
}

const initialOthers: Others = {
  name: 'Others',
  activities: 0,
  distance: 0,
  elevation: 0,
  time: 0,
  kudos: 0,
  farthest: initialSingleActivity,
  longest: initialSingleActivity,
};

interface Category {
  type: ActivityType;
  name: string;
  activities: number;
  distance: number;
  elevation: number;
  time: number;
  kudos: number;
  farthest: SingleActivity;
  longest: SingleActivity;
  speedAverage: number;
  speedMax: number;
  heartrateAverage: number;
  heartrateMax: number;
  cadenceAverage: number;
  wattsAverage: number;
  wattsMax: number;
}

const initialCategory = (type: ActivityType, name: string): Category => ({
  type: type,
  name: name,
  activities: 0,
  distance: 0,
  elevation: 0,
  time: 0,
  kudos: 0,
  farthest: initialSingleActivity,
  longest: initialSingleActivity,
  speedAverage: 0,
  speedMax: 0,
  heartrateAverage: 0,
  heartrateMax: 0,
  cadenceAverage: 0,
  wattsAverage: 0,
  wattsMax: 0,
});

type Total = {
  name: string;
  activities: number;
  distance: number;
  elevation: number;
  time: number;
  farthest: SingleActivity;
  longest: SingleActivity;
  elevatest: SingleActivity;
  kudoest: SingleActivity;
  peak: number;
  bottom: number;
  companions: number;
  achievements: number;
  comments: number;
  kudos: number;
  prs: number; // Should be data range and pr count
  maxHr: number;
  favoriteActivity: Option<ActivityType>;
  timeOfDay: Option<TimeOfDay>;
  favoriteDay: Option<DayOfWeek>;
};

const initialTotal: Total = {
  name: 'Total',
  activities: 0,
  distance: 0,
  elevation: 0,
  time: 0,
  farthest: initialSingleActivity,
  longest: initialSingleActivity,
  elevatest: initialSingleActivity,
  kudoest: initialSingleActivity,
  peak: 0,
  bottom: 0,
  companions: 0,
  achievements: 0,
  comments: 0,
  kudos: 0,
  prs: 0,
  maxHr: 0,
  favoriteActivity: none,
  timeOfDay: none,
  favoriteDay: none,
};

export interface Statistics {
  type: Option<ActivityType>;
  data: {
    total: Total;
    run: Category;
    ride: Category;
    swim: Category;
    others: Others;
  };
}

export const initialStatistics: Statistics = {
  type: none,
  data: {
    total: initialTotal,
    run: initialCategory('Run', 'Running'),
    ride: initialCategory('Ride', 'Cycling'),
    swim: initialCategory('Swim', 'Swimming'),
    others: initialOthers,
  },
};

// LENSES
const updateTotal = (
  total: Partial<Total>,
  statistics: Statistics
): Statistics => {
  return {
    ...statistics,
    data: {
      ...statistics.data,
      total: {
        ...statistics.data.total,
        ...total,
      },
    },
  };
};

const updateCategory = (
  type: ActivityType,
  category: Partial<Category>,
  statistics: Statistics
): Statistics => {
  switch (type) {
    case 'Run':
      return {
        ...statistics,
        data: {
          ...statistics.data,
          run: {
            ...statistics.data.run,
            ...category,
          },
        },
      };

    case 'Ride':
      return {
        ...statistics,
        data: {
          ...statistics.data,
          ride: {
            ...statistics.data.ride,
            ...category,
          },
        },
      };

    case 'Swim':
      return {
        ...statistics,
        data: {
          ...statistics.data,
          swim: {
            ...statistics.data.swim,
            ...category,
          },
        },
      };

    default:
      return statistics;
  }
};

const updateOthers = (
  others: Partial<Others>,
  statistics: Statistics
): Statistics => {
  return {
    ...statistics,
    data: {
      ...statistics.data,
      others: {
        ...statistics.data.others,
        ...others,
      },
    },
  };
};

// UTILS
function findMostFrequentString<T>(arr: Option<T>[]): Option<T> {
  let f: number = 1;
  let p: number = 0;

  let item: Option<T> = none;

  const E = getEq(eqString);

  for (let i = 0; i < arr.length; i++) {
    for (let j = i; j < arr.length; j++) {
      if (E.equals(arr[i] as Option<string>, arr[j] as Option<string>)) {
        p++;
      }

      if (f < p) {
        f = p;
        item = arr[i];
      }
    }

    p = 0;
  }

  return item;
}

const getLarger = (n1: number, n2: number) => (n1 < n2 ? n2 : n1);
const getSmaller = (n1: number, n2: number) => (n1 > n2 ? n2 : n1);
const getAverage = (arr: number[]): number =>
  arr.length === 0 ? 0 : divide(sum(arr), arr.length);

const mapSingleActivity = ({
  id,
  name,
  distance,
  total_elevation_gain,
  moving_time,
  average_speed,
  kudos_count,
}: Activity): SingleActivity => {
  return {
    id,
    title: name,
    distance,
    elevation: total_elevation_gain,
    time: moving_time,
    speed: average_speed,
    kudos: kudos_count,
  };
};

const dateToDaytime = (date: Date): Option<TimeOfDay> => {
  if (isValidDate(date)) {
    const hours = date.getUTCHours();

    if (hours < 13) {
      return some('morning');
    } else if (hours < 19) {
      return some('day');
    } else {
      return some('evening');
    }
  }

  return none;
};

const dateToWeekday = (date: Date): Option<DayOfWeek> => {
  if (isValidDate(date)) {
    const day = date.getDay();

    switch (day) {
      case 1:
        return some('monday');
      case 2:
        return some('tuesday');
      case 3:
        return some('wednesday');
      case 4:
        return some('thursday');
      case 5:
        return some('friday');
      case 6:
        return some('saturday');
      default:
        return some('sunday');
    }
  }

  return none;
};

const categoryCollector = () => {
  const speedAcc: number[] = [];
  const heartrateAcc: number[] = [];
  const cadenceAcc: number[] = [];
  const wattsAcc: number[] = [];

  return {
    fill: ({
      speed,
      heartrate,
      cadence,
      watts,
    }: {
      speed: number;
      heartrate?: number;
      cadence?: number;
      watts?: number;
    }) => {
      speedAcc.push(speed);

      heartrate && heartrateAcc.push(heartrate);
      cadence && cadenceAcc.push(cadence);
      watts && wattsAcc.push(watts);
    },
    getSpeed: () => speedAcc,
    getHeartrate: () => heartrateAcc,
    getCadence: () => cadenceAcc,
    getWatts: () => wattsAcc,
  };
};

// DISPLAY
export const displayTime = (sec: number): string => {
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec - hours * 3600) / 60);
  const seconds = sec - hours * 3600 - minutes * 60;

  const addLeadingZero = (num: number) => num.toString().padStart(2, '0');

  return `${addLeadingZero(hours)}:${addLeadingZero(minutes)}:${addLeadingZero(
    seconds
  )}`;
};

export const displayElevation = (meters: number): string => {
  return `${Math.round(meters)}`;
};

export const displaySpeed = (metersPerSecond: number): string => {
  return `${Math.round(metersPerSecond * 3.6 * 100) / 100}`;
};

export const displayRunningCadence = (stepsPerMinute: number): string => {
  // Cause running cadence returns for 2 legs
  return `${Math.round(stepsPerMinute * 2)}`;
};

export const displayDistance = (meters: number): string => {
  return `${Math.round((meters / 1000) * 10) / 10}`;
};

export const displayRound = (num: number): string => {
  return `${Math.round(num)}`;
};

// STATISTICS
const generate = (
  activities: Activities,
  type: Option<ActivityType>
): Statistics => {
  let accumulator: Statistics = {
    ...initialStatistics,
    type,
  };

  let atCollector: Option<ActivityType>[] = [];
  let todCollector: Option<TimeOfDay>[] = [];
  let fdCollector: Option<DayOfWeek>[] = [];

  let runCollector = categoryCollector();
  let rideCollector = categoryCollector();
  let swimCollector = categoryCollector();

  const buildCategory = (
    category: Category,
    activity: Activity,
    statistics: Statistics
  ): Statistics => {
    return updateCategory(
      category.type,
      {
        activities: category.activities + 1,
        distance: category.distance + activity.distance,
        elevation: category.elevation + activity.total_elevation_gain,
        time: category.time + activity.moving_time,
        kudos: category.kudos + activity.kudos_count,
        farthest:
          category.farthest.distance < activity.distance
            ? mapSingleActivity(activity)
            : category.farthest,
        longest:
          category.longest.time < activity.moving_time
            ? mapSingleActivity(activity)
            : category.longest,
        speedMax: getLarger(category.speedMax, activity.max_speed),
        heartrateMax: activity.max_heartrate
          ? getLarger(category.heartrateMax, activity.max_heartrate)
          : category.heartrateMax,
        wattsMax: activity.max_watts
          ? getLarger(category.wattsMax, activity.max_watts)
          : category.wattsMax,
      },
      statistics
    );
  };

  const accumulated: Statistics = activities
    .filter(
      (activity: Activity) =>
        isNone(type) ||
        getEq(eqString).equals(fromNullable(activity.type), type)
    )
    .reduce(
      (
        acc: Readonly<Statistics>,
        activity: Activity,
        index: number,
        arr: Activities
      ): Statistics => {
        const { total, run, ride, swim, others } = acc.data;

        atCollector.push(fromNullable(activity.type));
        todCollector.push(dateToDaytime(new Date(activity.start_date_local)));
        fdCollector.push(dateToWeekday(new Date(activity.start_date_local)));

        acc = updateTotal(
          {
            activities: total.activities + 1,
            distance: total.distance + activity.distance,
            elevation: total.elevation + activity.total_elevation_gain,
            time: total.time + activity.moving_time,
            farthest:
              total.farthest.distance < activity.distance
                ? mapSingleActivity(activity)
                : total.farthest,
            longest:
              total.longest.time < activity.moving_time
                ? mapSingleActivity(activity)
                : total.longest,
            elevatest:
              total.elevatest.elevation < activity.total_elevation_gain
                ? mapSingleActivity(activity)
                : total.elevatest,
            kudoest:
              total.kudoest.kudos < activity.kudos_count
                ? mapSingleActivity(activity)
                : total.kudoest,
            companions: total.companions + activity.athlete_count,
            achievements: total.achievements + activity.achievement_count,
            comments: total.comments + activity.comment_count,
            kudos: total.kudos + activity.kudos_count,
            prs: total.prs + activity.pr_count,
            maxHr: activity.max_heartrate
              ? getLarger(total.maxHr, activity.max_heartrate)
              : total.maxHr,
            peak: activity.elev_high
              ? getLarger(total.peak, activity.elev_high)
              : total.peak,
            bottom: activity.elev_low
              ? getSmaller(total.bottom, activity.elev_low)
              : total.bottom,
          },
          acc
        );

        switch (activity.type) {
          case 'Run':
          case 'VirtualRun':
            runCollector.fill({
              speed: activity.average_speed,
              heartrate: activity.average_heartrate,
              cadence: activity.average_cadence,
            });

            acc = buildCategory(run, activity, acc);
            break;
          case 'Ride':
          case 'VirtualRide':
            rideCollector.fill({
              speed: activity.average_speed,
              heartrate: activity.average_heartrate,
              cadence: activity.average_cadence,
              watts: activity.average_watts,
            });

            acc = buildCategory(ride, activity, acc);
            break;
          case 'Swim':
            swimCollector.fill({
              speed: activity.average_speed,
              heartrate: activity.average_heartrate,
              cadence: activity.average_cadence,
            });

            acc = buildCategory(swim, activity, acc);
            break;
          default:
            acc = updateOthers(
              {
                activities: others.activities + 1,
                distance: others.distance + activity.distance,
                elevation: others.elevation + activity.total_elevation_gain,
                time: others.time + activity.moving_time,
                kudos: others.kudos + activity.kudos_count,
                farthest:
                  others.farthest.distance < activity.distance
                    ? mapSingleActivity(activity)
                    : others.farthest,
                longest:
                  others.longest.time < activity.moving_time
                    ? mapSingleActivity(activity)
                    : others.longest,
              },
              acc
            );
        }

        if (index === arr.length - 1) {
          acc = updateTotal(
            {
              favoriteActivity: findMostFrequentString(atCollector),
              timeOfDay: findMostFrequentString(todCollector),
              favoriteDay: findMostFrequentString(fdCollector),
            },
            acc
          );

          acc = updateCategory(
            run.type,
            {
              speedAverage: getAverage(runCollector.getSpeed()),
              cadenceAverage: getAverage(runCollector.getCadence()),
              heartrateAverage: getAverage(runCollector.getHeartrate()),
            },
            acc
          );

          acc = updateCategory(
            ride.type,
            {
              speedAverage: getAverage(rideCollector.getSpeed()),
              cadenceAverage: getAverage(rideCollector.getCadence()),
              heartrateAverage: getAverage(rideCollector.getHeartrate()),
              wattsAverage: getAverage(rideCollector.getWatts()),
            },
            acc
          );

          acc = updateCategory(
            swim.type,
            {
              speedAverage: getAverage(swimCollector.getSpeed()),
              cadenceAverage: getAverage(swimCollector.getCadence()),
              heartrateAverage: getAverage(swimCollector.getHeartrate()),
            },
            acc
          );
        }

        return acc;
      },
      accumulator
    );

  return accumulated;
};

type Persisted = {
  id: number;
  data: Statistics;
};

const storageKey = 'statistics';

export const persist = (id: number, data: Statistics): boolean => {
  return ls.set<Persisted>(storageKey, {
    id,
    data,
  });
};

export const read = (): Persisted => {
  return ls.get<Persisted>(storageKey);
};

export const clear = (): void => {
  return ls.remove(storageKey);
};

export default generate;

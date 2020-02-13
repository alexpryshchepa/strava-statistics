import * as t from 'io-ts';

export type RequestErrorType = 'access' | 'parsing' | 'default';

export type GetActivitiesRequestParams = {
  before?: number;
  after?: number;
  page?: number;
  per_page?: number;
};

export type RequestParams = {
  method?: string;
};

const ActivityType = t.union([
  t.literal('AlpineSki'),
  t.literal('Canoeing'),
  t.literal('BackcountrySki'),
  t.literal('Crossfit'),
  t.literal('EBikeRide'),
  t.literal('Elliptical'),
  t.literal('Golf'),
  t.literal('Handcycle'),
  t.literal('Hike'),
  t.literal('IceSkate'),
  t.literal('InlineSkate'),
  t.literal('Kayaking'),
  t.literal('Kitesurf'),
  t.literal('NordicSki'),
  t.literal('Ride'),
  t.literal('RockClimbing'),
  t.literal('RollerSki'),
  t.literal('Rowing'),
  t.literal('Run'),
  t.literal('Sail'),
  t.literal('Skateboard'),
  t.literal('Snowboard'),
  t.literal('Snowshoe'),
  t.literal('Soccer'),
  t.literal('StairStepper'),
  t.literal('StandUpPaddling'),
  t.literal('Surfing'),
  t.literal('Swim'),
  t.literal('Velomobile'),
  t.literal('VirtualRide'),
  t.literal('VirtualRun'),
  t.literal('Walk'),
  t.literal('WeightTraining'),
  t.literal('Wheelchair'),
  t.literal('Windsurf'),
  t.literal('Workout'),
  t.literal('Yoga'),
]);

export type ActivityType = t.TypeOf<typeof ActivityType>;

export const Athlete = t.type({
  id: t.number,
  firstname: t.string,
  lastname: t.string,
  city: t.union([t.string, t.null]),
  created_at: t.string,
  profile: t.string,
});

export type Athlete = t.TypeOf<typeof Athlete>;

const Activity = t.intersection([
  t.type({
    name: t.string,
    distance: t.number,
    moving_time: t.number,
    total_elevation_gain: t.number,
    type: ActivityType,
    id: t.number,
    start_date_local: t.string,
    achievement_count: t.number,
    kudos_count: t.number,
    comment_count: t.number,
    athlete_count: t.number,
    average_speed: t.number,
    max_speed: t.number,
    pr_count: t.number,
    has_kudoed: t.boolean,
  }),
  t.partial({
    max_watts: t.number,
    average_heartrate: t.number,
    max_heartrate: t.number,
    average_cadence: t.number,
    average_watts: t.number,
    elev_high: t.number,
    elev_low: t.number,
  }),
]);

export type Activity = t.TypeOf<typeof Activity>;

export const Activities = t.array(Activity);

export type Activities = t.TypeOf<typeof Activities>;

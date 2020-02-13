import cookie from 'js-cookie';
import {
  RequestErrorType,
  Athlete,
  Activities,
  GetActivitiesRequestParams,
  RequestParams,
} from './types';
import { isRight } from 'fp-ts/lib/Either';
import queryString from 'query-string';
import { PathReporter } from 'io-ts/lib/PathReporter';

class RequestError extends Error {
  private type: RequestErrorType;

  constructor(message: string, type: RequestErrorType) {
    super(message);
    this.type = type;
  }
}

export const endpoints = {
  login: `https://www.strava.com/oauth/authorize?client_id=${
    process.env.REACT_APP_STRAVA_CLIENT_ID
  }&response_type=code&redirect_uri=${process.env
    .REACT_APP_STRAVA_DEV_REDIRECT_URI ||
    `${window.location.protocol}//${window.location.host}`}/auth/callback&approval_prompt=force&scope=activity:read_all`,
  logout: 'https://www.strava.com/oauth/deauthorize',
  athlete: 'https://www.strava.com/api/v3/athlete',
  activities: (params: GetActivitiesRequestParams): string =>
    `https://www.strava.com/api/v3/athlete/activities?${queryString.stringify(
      params
    )}`,
  activity: (id: number): string =>
    `https://www.strava.com/api/v3/athlete/activities/${id}`,
};

const request = (url: string, { ...params }: RequestParams) => {
  const token = cookie.get('token');

  if (token) {
    return fetch(url, {
      ...params,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }).then(async response => {
      let parsedResponse;

      if (response.status === 401) {
        return Promise.reject(
          new RequestError('Access denied, please login again', 'access')
        );
      }

      try {
        parsedResponse = response.json();
      } catch {
        return Promise.reject(
          new RequestError('Cannot parse server response', 'parsing')
        );
      }

      return await parsedResponse
        .then(data => {
          if (data.errors) {
            return Promise.reject(new Error(data.message));
          }

          return Promise.resolve(data);
        })
        .catch(err => Promise.reject(new RequestError(err, 'default')));
    });
  }

  return Promise.reject(
    new RequestError('Token does not exist, please login again', 'access')
  );
};

export const getUser = (): Promise<Athlete> => {
  return request(endpoints.athlete, {}).then((data: Athlete) => {
    const result = Athlete.decode(data);

    if (isRight(result)) {
      return Promise.resolve(data);
    }

    console.log(PathReporter.report(result));

    return Promise.reject(
      new RequestError('Response data is not valid', 'parsing')
    );
  });
};

export const getActivities = (
  params: GetActivitiesRequestParams
): Promise<Activities> => {
  return request(endpoints.activities(params), {}).then((data: Activities) => {
    const result = Activities.decode(data);

    if (isRight(result)) {
      return Promise.resolve(data);
    }

    console.log(PathReporter.report(result));

    return Promise.reject(
      new RequestError('Response data is not valid', 'parsing')
    );
  });
};

export const logout = () => {
  return request(endpoints.logout, { method: 'POST' });
};

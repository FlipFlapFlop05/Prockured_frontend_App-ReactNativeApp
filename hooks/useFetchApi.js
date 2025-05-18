/* eslint-disable react-hooks/exhaustive-deps */
import axios from 'axios';
import {useState, useEffect} from 'react';
import Config from 'react-native-config';

const useFetchApi = (
  {
    fullURL = null,
    url = '',
    method = 'GET',
    sendImmediately = false,
    params = null,
    body = null,
    headers = {},
    isAsync = false,
    data: dataPassedWhenCalled = null,
  },
  dataTransform = null,
  errorTransform = null,
) => {
  console.log(`useFetchApi called with URL: ${url} and method: ${method}`);

  const [fetching, setFetching] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const getBaseURL = () => {
    const hostname = window.location.hostname;
    if (hostname.includes('kamaiipro.in')) {
      return process.env.REACT_APP_API_URL_1; // Adjust accordingly
    } else if (hostname.includes('deckster.com')) {
      return process.env.REACT_APP_API_URL_2; // Adjust accordingly
    }
    return process.env.REACT_APP_API_URL_1; // Default URL if no match
  };

  // Effect to call the API immediately if required
  useEffect(() => {
    if (sendImmediately) {
      execute();
    }
  }, [sendImmediately]);

  // Handle errors (network or response errors)
  const catchErrorHandler = err => {
    const errorMessage = errorTransform ? errorTransform(err) : err.message;
    setError(errorMessage);
    setFetching(false);
    setData(null);
  };

  // Success handler to set the data after transformation
  const thenSuccessHandler = response => {
    const resultData = dataTransform
      ? dataTransform(response?.data)
      : response?.data;
    setData(resultData);
    setFetching(false);
    setError(null);
  };

  if (method.toUpperCase() == 'POST') {
    headers['Content-Type'] = 'multipart/form-data';
  }

  // Execute the API call with new parameters
  const execute = async (newProps = {}) => {
    setFetching(true);
    let effectiveUrl = fullURL || `${Config.API_BASE_URL}${url}`;
    console.log(`API URL: ${effectiveUrl} ${url}`);

    let effectiveHeaders = {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    };
    let effectiveParams = {...params, ...newProps.params};
    let effectiveBody = newProps.body || body;

    // Set method-specific configurations
    const axiosConfig = {
      headers: effectiveHeaders,
      params: effectiveParams,
    };

    try {
      let response;
      switch (method.toUpperCase()) {
        case 'GET':
          response = await axios.get(effectiveUrl, axiosConfig);
          break;
        case 'POST':
          response = await axios.post(effectiveUrl, effectiveBody, axiosConfig);
          break;
        case 'PUT':
          response = await axios.put(effectiveUrl, effectiveBody, axiosConfig);
          break;
        case 'DELETE':
          response = await axios.delete(effectiveUrl, axiosConfig);
          break;
        default:
          throw new Error('Invalid HTTP method specified.');
      }

      if (isAsync) {
        thenSuccessHandler(response);
      } else {
        thenSuccessHandler(response);
      }
    } catch (error) {
      if (isAsync) {
        catchErrorHandler(error);
      } else {
        catchErrorHandler(error);
      }
    }
  };

  return [{data, fetching, error}, execute];
};

export default useFetchApi;

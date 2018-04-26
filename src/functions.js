import axios from 'axios';

export const get = async(route) => {
  const headers = {
    'X-CSRFToken': document.cookie.replace('csrftoken=', ''),
  };
  
  return (await axios.get(`api/${route}/`, null, { headers })).data.res;
};

export const post = async(route, body) => {
  const headers = {
    'X-CSRFToken': document.cookie.replace('csrftoken=', ''),
  };

  return (await axios.post(`api/${route}/`, JSON.stringify(body), { headers })).data.res;
}
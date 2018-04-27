import axios from 'axios';

export const get = async(route, body = null) => {
  const headers = {
    'X-CSRFToken': document.cookie.replace('csrftoken=', ''),
  };
  
  // cannot figure out how to send req.params with axios.get
  // return (await axios.get(`api/${route}/`, body, { headers })).data.res;
  return (await axios.post(`api/${route}/`, JSON.stringify(body), { headers })).data.res;
};

export const post = async(route, body) => {
  const headers = {
    'X-CSRFToken': document.cookie.replace('csrftoken=', ''),
  };

  return (await axios.post(`api/${route}/`, JSON.stringify(body), { headers })).data.res;
};

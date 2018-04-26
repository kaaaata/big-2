import axios from 'axios';

export const get = async(route) => {
  const headers = {
    'X-CSRFToken': document.cookie.replace('csrftoken=', ''),
  };
  
  return (await axios.get(route + '/', JSON.stringify('something'), { headers })).data;
};

export const post = async(route, body) => {
  const headers = {
    'X-CSRFToken': document.cookie.replace('csrftoken=', ''),
  };

  return (await axios.post(route + '/', JSON.stringify(body), { headers })).data;
}
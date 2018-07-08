import axios from 'axios';
import qs from 'qs';

axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = 'csrftoken';

// get cookie method from django docs
function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
          var cookie = cookies[i].trim();
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
};

export const get = async(route, params = null) => {
  const headers = {
    'X-CSRFToken': getCookie('csrftoken'),
  };
  
  return (
    (await axios.get(
      `/${route}`,
      { params, 'paramsSerializer': parameters => qs.stringify(parameters) },
      { headers },
    )).data
  );
};

export const post = async(route, body) => {
  const headers = {
    'X-CSRFToken': getCookie('csrftoken'),
  };

  return (
    (await axios.post(
      `/${route}`,
      body,
      { headers },
    )).data
  );
};

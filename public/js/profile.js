const newFormHandler = async (event) => {
event.preventDefault();

const name = document.querySelector('#location-name').value.trim();
 
  if (name) {
    const response = await fetch(`/api/locations`, {
      method: 'POST',
      body: JSON.stringify({ name }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      document.location.replace('/profile');
    } else {
      alert('Failed to save location');
    }
  }
};

const delButtonHandler = async (event) => {
  if (event.target.hasAttribute('data-id')) {
    const id = event.target.getAttribute('data-id');

    const response = await fetch(`/api/locations/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      document.location.replace('/profile');
    } else {
      alert('Failed to delete location');
    }
  }
};

const addLocationBtn = async () => {
  const response = await fetch('/profile', {
    method: 'GET'
  });
  if (response.ok) {
    document.location.replace('/profile');
  } else {
    alert(response.statusText);
  }
};
document.querySelector('#addLocation').addEventListener('click', addLocationBtn);

document
  .querySelector('.new-location-form')
  .addEventListener('submit', newFormHandler);

document
  .querySelector('.location-list')
  .addEventListener('click', delButtonHandler);

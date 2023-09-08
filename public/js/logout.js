const logout = async () => {
  console.log ('entering logout function');
  const response = await fetch('/api/users/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  console.log('finished with logout function fetch of /api/users/logout');

  if (response.ok) {
    document.location.replace('/login');
    console.log('logout function replace to /login complete');
  } else {
    alert(response.statusText);
  }
};

document.querySelector('#logout').addEventListener('click', logout);

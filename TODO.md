# TODO

- [x] Add check collisions use case before adding a new task
It should ask if the task have a collision and if it does, ask the user to choose if continue or cancel to task creation
  - On continue: call create task use case
  - On cancel: reset the form

- [x] Handle update tasks use case
  - [x] Complete
  - [x] Cancel 

- [ ] The app can't be closed if there's a journey in progress

- [x] Pending tasks list

- [ ] Take screenshots of the main screen
  - [ ] Test it 
  - [ ] `Firestore` upload 

- [ ] While checking token, show a loading spinner

- [ ] Improve re renderings in the app
  - Tasks page
  - [ ] prove to store all ipc responses in one `useEffect`


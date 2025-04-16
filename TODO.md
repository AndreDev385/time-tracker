# TODO
- [ ] Take screenshots of the main screen
  - [x] Test it 
  - [x] `Backblaze` upload
  - [ ] configure ipc to capture the screenshot every x time
- [ ] Journey, add total by date

## pending
- [x] Add `interval[0].startAt` - `interval[last].endAt` | `Duration` and `commnet` in completed task
- [x] Move pending tasks and completed tasks of the day to the journey layout
  - [x] Add readonly property to task table
- [x] update toolbar journey 
- [ ] Change collision message
  - [ ] Send `taskType.name` and `user.name` from the API response 
- [x] update task table like in the web page
- [ ] Don't expand vertically the toolbar

```text
Expediente ya realizado!

El usuario xxxxxx ya ha dibujado/preparado este expediente, si deseas continuar se le cambiara el tiempo dedicado de "PRODUCTIVO" a "NO PRODUCTIVO" al usuario xxxxx  ¿Estas seguro que deseas continuar?
```

## Handle ending journey
- [x] When closing the app
- [x] When inactivity threshold reached
  - [x] Look for inactivity time allowed
  - [x] End journey
- [ ] When shutdown the computer (test it)

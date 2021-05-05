# Diakôluô Synchronise Protocol - Version 1.0 WIP
It is the definition of the protocol that is used to synchronise test in multiple browser and to share it to multiple users.

# Definitions

## i18n string
A i18n string represent a normal string but if it starts with "_", it will be interpreted as a i18n id (it require to be set in the application translations.csv file), and will be dynamically load depending of the locale.

## FieldObjects
### FieldObject
It is composed of fields JSON objects, FieldObject, CustomFieldObject:
 - value: the default value for the field
 - mode: of should the field be display: required | normal | readonly | hide

If it is a integer field (custom or not):
 - max: the max value authorized (integer)
 - min: the min value authorized (integer)

### CustomFieldObject
The customFieldObject inherit from [FieldObject](#FieldObject).
 - name: the name of the field
 - label: the [i18n string](#i18n-string) that represent the label to show to the user
 - type: the type of field: string | integer

# Requirements
## Server
The server must allows CORS of the Diakôluô origin (antoninloubiere.github.io), or if the app is hosted by the same server, it will be optional.

## Forms
Forms must be send with JSON

## Valid username
All username that can be use in an URL could be used, so username should not contain « / ». And the « edit » username is reserved and must not be used.

## Valid tests id
All id are valid, even if they contains a « / » character but they cannot be « new » or start with « new/ ».
For example, `<random-string>` or `<user>/<random-string>` could be valid ids. A base64 string work.

# API Description
The description of the API and the different URL to use. The root used in this document: "/", represents the path of the synchronise server, for example if the API is defined at this URL: www.example.com/api/dkl/, "/example/" will mean: www.example.com/api/dkl/example/. The user should be able to set the root of a synchronise server.
The string type for parameters is implied.

## General API

### Authentication
#### Request:
POST `/login`

Parameters:
 - username: the username of the user
 - password: the password of the user

#### Response:
If the login is correct: the server should respond with a success status code like [200](#200---OK) or [204](#204---No-content) and should set a session cookies.
If the response content is "SING IN REQUIRED" (case insensitive), the client should start the sign in process: see [sign in](#Sign-in)

If the login is incorrect: the server should respond with a status code [401](#401---Unauthorized).

#### Request:
GET `/logout`
Logout.
#### Response:
The server should invalidate the session id and remove it from the client.

### Sign in
#### Request
GET `/signin`
Get informations about the form to create for the sign in form.

Parameters (optionals):
 - username: the username of the user if an authentication is required
 - password: the password of the user if an authentication is required

#### Response
The server should respond with a JSON object that describe the form to sign in. If the authentication failed, the server may respond with a [401](#401---Unauthorized) error.

The JSON object that the server should respond:
- username: the username of the user ([FieldObject](#FieldObject))
- password: the new password of the user ([FieldObject](#FieldObject))
- name: the name of the user ([FieldObject](#FieldObject))
- custom fields an array of [CustomFieldObjects](#CustomFieldObject) to show in the sign form

If a standardised field isn't defined, it should be interpreted for the client as a hidden fields


### Sign in apply
#### Request
POST `/signin`

Parameters:
- auth-username: the username to authenticate if required
- auth-password: the password to authenticate if required
- username: the user name of the new user if it is allowed
- password: the password of the new user
- name: the name of the new user
- custom fields: an array of objects that holds the custom fields demanded by the server:
   - name: the name of the field
   - value: the value of the field

#### Response
If the auth is incorrect, it should respond like [login](#Authentication): [401](#401---Unauthorized).
If it is correct, it should just respond a success result code.

### User informations
#### Request
GET `/user` to get informations about the current user or 

GET `/user/<user>` to get informations about a specific user

#### Response
Return a JSON object with informations for the client:
 - username: the username of the user
 - name: the name of the user
 - fields: an array of custom fields objects:
   - label: the label to show ([i18n string](#i18n-string))
   - value: the value to show

### Edit User
#### Request
GET `/user/edit` to edit current user or

GET `/user/edit/<user>` to edit a specific user if you have the permissions. 

#### Response
Return a JSON object that describe the edit user form.

Parameters:
 - username: the username of the user [FieldObject](#FieldObject)
 - name: the name of the user [FieldObject](#FieldObject)
 - fields: an array of [CustomFieldObject](#CustomFieldObject) that represent custom fields define by the server.

### Edit User apply
#### Request
POST `/user/edit` to edit current user or

POST `/user/edit/<user>` to edit a specific user if you have the permissions. 

Return a JSON object that describe the edit user form.

Parameters:
 - username: the username of the user
 - name: the name of the user
 - fields: an array of custom objects with values:
   - name: the name of the field
   - value: the value that the user set

#### Response
If it is correct, the server should respond with a JSON object that represent the informations of the user, like the [user informations](#User-informations) request. But the field form-correct: true should be added.

If it is incorrect, malformed, it should respond with a JSON objects:
 - form-correct: should be set to false
 - errors: an array of JSON objects that indicate all malformed fields:
    - name: the name of the fields that have an error
    - reason: the reason of the error ([i18n string](#i18n-string))

### Delete user
#### Request
DELETE `/user` to delete the current user or

DELETE `/user/<user>` to delete a specific user

#### Response
The server should respond with the corresponding result code.

## Tests API
There is some [test id restrictions](#Valid-tests-id).

### Get tests
#### Request
GET `/test` get the test which the user has access.

#### Response
The server should respond with a JSON object:
 - tests: an array of test id that the user owns
 - user-share: a JSON list of objects that hold tests share with the user JSON objects:
    - usernames: the username
    - tests: list of test id that are shared with him.
 - group-share: a JSON list of object that hold tests share with the user: JSON objects:
    - group: the name of the group
    - tests: list of test id that are shared with the group
 - link-share: list of tests id share by a link

### Get a test
#### Request

GET `/test/<id>` get the test at the id.

Parameters:
 - last-modification: the date of the last modification (unix timestamp)
#### Response
The server should respond a diakôluô file like the export button does in the application. Or responds an error respond status. If the test haven't been changed since the last modification date, the server should respond with 304 (Not Modified).

### Get test info
#### Request
GET `/test/<id>/info` get informations about the test, like owner, share informations for the current user
#### Response
The server should respond with a JSON object
 - owner: the owner username
 - share: how the test is [shared](#Share-a-test) for the user view | edit | all

### Edit a test
#### Request
POST `/test/<id>` edit the test at the id.

Parameters:
 - last-modification: the last modification before this, to verify that there isn't a conflict (unix timestamp) 
 - override: say if the user allow: (boolean, optional, default value: false)
 - test: the test to set

#### Response
The server should respond with a result code: [200](#200---OK) or an error. If there is a conflict and the override fields is set to true, the server could respond with "CONFLICTS" (case insensitive) the client should show a warning dialogue.

### Delete a test
#### Request
DELETE `/test/<id>` delete the test at the id

#### Response
The server should respond with the appropriate status code.

### Share a test
#### Request
GET `/test/<id>/share` get how a test could be share.

#### Response
The server should respond with a JSON object:
 - user-perms: if the user can share it with other internal users, values: none | view | edit | all
 - groups-perms: if the user can share it with other groups, values : none | view | edit | all
 - links-perms: if the user can share it with a link, values: none  | view | edit | all
 - users: an array of rules: rules are JSON objects:
   - username: the username of the user with perms
   - perms: the perms of this user
 - groups: an array of rules: rules are JSON objects:
   - id: the id of the group
   - perms: the perms of the group
 - link: the perms associated with the persons who have the link

None: mean no share, View: only for view purposes, Edit: for view and edit purposes: All: Can view, edit, and manage parameters about the test (like sharing). Only the owner should be able to delete it.

Only persons that have the « all » permissions could access that (including the owner).

## Share a test apply
#### Request
POST `test/<id>/share` set a test share options

Parameters:
 - user: an array of rules: rules are JSON objects:
   - username: the username of the user
   - perms: the perms for the user
 - group: an array of rules: rules are JSON objects:
   - id: the id of the group
   - perms: the perms for the group
 - link: the perms for the people who have the link

 This is not incremental, if you want to add a user, you should also send all the previous perms !

 #### Response
 The server should respond with the appropriate result code. If it is a success, the server should respond with the [share infos](#Share-a-test).

# Response codes
When API requests are made the server may responds with some status codes, that the client should handle.

## Success

### 200 - OK
Like specified in HTTP, the request succeed, nothing to report.

### 204 - No content
Like specified in HTTP, the request succeed but there is no content to respond.

## Errors

### 401 - Unauthorized
The server responds with this error code when the client isn't authenticated and that the client should authenticate itself before retrying again. Or if it is in the [login request](#Authentication) it mean that the login failed.

### 403 - Forbidden
The sever responds with this error if the client is authenticated but, the user is not authorized to access this element. The client should show an error message.

### 404 - Page not found
The page does not exist or the server don't want you to know that it's exist.

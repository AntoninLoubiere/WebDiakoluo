# Diakôluô Synchronise Protocol - Version 1.0 WIP
It is the definition of the protocol that is used to synchronise test in multiple browser and to share it to multiple users.


# Requirements
## Server
The server must allows CORS of the Diakôluô origin (antoninloubiere.github.io), or if the app is hosted by the same server, it will be optional.

## Valid username
All username that can be use in an URL could be used, so username should not contain « / ». And the « edit » username is reserved and must not be used.

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
If the login is correct: the server should responds with a success status code like [200](#200---OK) or [204](#204---No-content) and should set a session cookies.
If the response content is "Sign in required" (case insensitive), the client should start the sign in process: see [sign in](#Sign-in)

If the login is incorrect: the server should responds with a status code [401](#401---Unauthorized).

### Sign in
#### Request
GET `/signin`
Get informations about the form to create for the sign in form.

Parameters (optionals):
 - username: the username of the user if an authentication is required
 - password: the password of the user if an authentication is required

#### Response
The server should responds with a JSON object that describe the form to sign in. If the authentication failed, the server may respond with a [401](#401---Unauthorized) error.

The JSON object that the server should responds:
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

If it is correct, the server should respond with a JSON object that represent the informations of the user, like the [user informations](#User-informations) request. But the field form-correct: true should be added.

If it is incorrect, malformed, it should responds with a JSON objects:
 - form-correct: should be set to false
 - errors: an array of JSON objects that indicate all malformed fields:
    - name: the name of the fields that have an error
    - reason: the reason of the error ([i18n string](#i18n-string))

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
The server should respond with the corresponding result code (200, 204, 401, 403...).

### Delete user
#### Request
DELETE `/user` to delete the current user or

DELETE `/user/<user>` to delete a specific user

#### Response
The server should respond with the corresponding result code.

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

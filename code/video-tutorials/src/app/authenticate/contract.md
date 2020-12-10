# Authenticate Application

Handles authentication

## Stream Categories

|         |                   |
| ------- | ----------------- |
| entity  | `authentication`  |

## Events

### UserLoggedIn

Written when a use successfully logs in.

Data:

* `userId` - The id of the user who logged in

Example:

```
{
  "id": "40f969ec-d6ea-466e-beb5-d37543db162e",
  "type": "UserLoggedIn",
  "data": {
    "userId": "e90647af-8103-4fe9-ae1f-4766103cca54"
  }
}
```

### UserLoginFailed

Written when a user attempts to login and fails.  Sometimes we'll know who the user is, and sometimes we won't.

When a login attempt fails, we don't necessarily know who was attempting to log in.  We *can* know the id associated with the email address used in the attempt, but we don't actually know if it was that user attempting to log in.

So, we'll still write the events to streams such as `authentication-a77c08af-83c4-4b29-89e5-a7e16dac37f6`, where the entity id matches the id of the user owning the email address.  However, we can't fill in the `userId` metadata.

When we don't know who the user is, we won't write that to the Message Store.  That's just system telemetry data and not relevant to our domain model.

Data:

* `userId` - The id of the user who logged in
* `reason` - A string explaining why the attempt was a failure

Example where we did know the user:

```
{
  "id": "a314d64f-6e4f-4a99-bfd4-5cf5afc52846",
  "type": "UserLoginFailed",
  "data": {
    "userId": "e90647af-8103-4fe9-ae1f-4766103cca54",
    "reason": "Incorrect password"
  }
}
```

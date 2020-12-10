# Send Email Service

If you need to send email, it goes through here.

## Stream Categories

|         |                     |
| ------- | ------------------- |
| command | `sendEmail:command` |
| entity  | `sendEmail`         |

## Commands

### Send

When you want to send an email, write one of these.  Note, all emails in this system come from a defined system email address, so the caller does not specify a from address.

Data:

* `emailId` - An identifier for the email
* `to` - The receiving email address
* `subject` - The subject line
* `text` - Plaintext version of the email
* `html` - HTML version of the body

Example:

```
{
  "id": "636401d3-6585-4887-8576-ec8003e6b380",
  "type": "Send",
  "data": {
    "emailId": "e0c6e804-ae9e-4c9c-bd55-b0c049a03993",
    "to": "lucky-recipient@example.com",
    "subject": "Rare investment opportunity",
    "text": "12 million US pounds stirling",
    "html": "<blink>12 million US pounds stirling</blink>"
  }
}
```

## Events

### Sent

When an email has been sent, we write this event.

Tradeoff: It is possible to successfully send an email and then have something go wrong before this type of even is recorded.  Because this event is written after sending the email, when this service restarts, it will send the email a second time.  We find this preferable to never sending the email in the first place.

Data:

* `emailId` - An identifier for the email
* `to` - The receiving email address
* `from` - The sending email address
* `subject` - The subject line
* `text` - Plaintext version of the email
* `html` - HTML version of the body

Example:

```
{
  "id": "c5f672bd-cf5f-4e6b-91ad-60a17cd6bbab",
  "type": "Sent",
  "data": {
    "emailId": "e0c6e804-ae9e-4c9c-bd55-b0c049a03993",
    "to": "lucky-recipient@example.com",
    "from": "exiled-prince@example.com",
    "subject": "Rare investment opportunity",
    "text": "12 million US pounds stirling",
    "html": "<blink>12 million US pounds stirling</blink>"
  }
}
```
### Failed

When sending an an email fails, we write this event.

Data:

* `emailId` - An identifier for the email
* `reason` - The reason why sending the email failed
* `to` - The receiving email address
* `from` - The sending email address
* `subject` - The subject line
* `text` - Plaintext version of the email
* `html` - HTML version of the body


Example:

```
{
  "id": "636401d3-6585-4887-8576-ec8003e6b380",
  "type": "Failed",
  "data": {
    "emailId": "e0c6e804-ae9e-4c9c-bd55-b0c049a03993",
    "reason": "Could not reach email provider",
    "to": "lucky-recipient@example.com",
    "from": "exiled-prince@example.com",
    "subject": "Rare investment opportunity",
    "text": "12 million US pounds stirling",
    "html": "<blink>12 million US pounds stirling</blink>"
  }
}
```
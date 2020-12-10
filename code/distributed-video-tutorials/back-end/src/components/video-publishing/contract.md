# Video Publishing Service

This service handles getting user-created videos published.  Publishing a video involves transcoding it to suitable formatting and managing video metadata.

|         |                           |
| ------- | ------------------------- |
| entity  | `videoPublishing`         |
| command | `videoPublishing:command` |

## Commands

### PublishVideo

Write this command to publish a video.  `video-publishing` will record the video to the owner's list of videos, transcode the video into the formats needed for a video to be published, and then mark the video published.

Data:

1. `ownerId` - The user who owns this video---can be different from the `userId`
2. `sourcUri` - Where the uploaded video can be retrieved
3. `videoId` - The id of the uploaded video

Example:

```
{
  "id": "f72ee7ab-066f-403c-b4b6-5f233fd34c81",
  "type": "PublishVideo",
  "data": {
    "ownerId": "bb6a04b0-cb74-4981-b73d-24b844ca334f",
    "sourceUri": "https://sourceurl.com/",
    "videoId": "9bfb5f98-36f4-44a2-8251-ab06e0d6d919"
  }
}
```

### NameVideo

Write this command when a user wants to give a video a different name.  The Video Publishing service will validate the name according to the following rules:

1. The name cannot be blank
2. The name cannot be the same as the video's current name

Data:

* `name` - The proposed new name

Example:

```
{
  "id": "b8723a39-f75a-41cb-a618-c4634e08da56",
  "type": "NameVideo",
  "data": {
    "videoId": "f94ce176-4a31-47e3-9593-c4ed4ee6ac84",
    "name": "Production Bugs Hate This Guy: 365 Things You Didn't Know About JS"
  }
}
```

## Events

### VideoNamed

Written to indicate that video has received a new name.

Data:

* `name` - The name the video was given

Example:

```
{
  "id": "c022a493-4784-4e54-84a1-df5e4e08553a",
  "type": "VideoNamed",
  "data": {
    "name": "Production Bugs Hate This Guy: 365 Things You Didn't Know About JS"
  }
}
```

### VideoNameRejected

Written when naming a video did not succeed.  Usually because of an error with the proposed new name.

Data:

* `name` - The attempted name
* `reason` - The reason why there was failure in applying the name

Example:

```
{
  "id": "19f71d45-eb38-4fde-9ed9-d1565ef61a2f",
  "type": "VideoNameRejected",
  "data": {
    "name": ""
    "reason": "ValidationError**{ \"name\": [ \"Can't be blank\" ]}"
  }
}
```

### VideoPublished

Written when this service has published the video.

Data:

1. `ownerId` - The id of the owning user
2. `sourceUri` - Where the uploaded video can be retrieved
3. `transcodedUri` - Where the transcoded video lives
4. `videoId` - The id of the uploaded video

Example:

```
{
  "id": "d260b63a-8195-4488-b5e4-8884ac792c61",
  "type": "VideoPublished",
  "data": {
    "ownerId": "bb6a04b0-cb74-4981-b73d-24b844ca334f",
    "sourceUri": "https://sourceurl.com/",
    "transcodedUri": "https://someswankyurl.com/"
    "videoId": "9bfb5f98-36f4-44a2-8251-ab06e0d6d919"
  }
}
```

### VideoPublishingFailed

Written when publishing a video fails.

Data:

1. `reason` - The reason why transcoding the video failed

Example:

```
{
  "id": "3ed7c799-7a74-4e98-9759-013ef031ac10",
  "type": "VideoPublishingFailed",
  "data": {
    "reason": "Invalid format",
    "ownerId": "bb6a04b0-cb74-4981-b73d-24b844ca334f",
    "sourceUri": "https://sourceurl.com/",
    "videoId": "9bfb5f98-36f4-44a2-8251-ab06e0d6d919"
  }
}
```

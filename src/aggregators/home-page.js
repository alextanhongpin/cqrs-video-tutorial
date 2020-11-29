function createHandlers({ queries }) {
  return {
    VideoViewed: event => queries.incrementVideosWatched(event.globalPosition)
  };
}

function createQueries({ db }) {
  async function incrementVideosWatched(globalPosition) {
    const result = await db`
      UPDATE page
      SET page_data = jsonb_set(
        jsonb_set(
          page_data,
          '{videosWatched}',
          ((page_data ->> 'videosWatched')::int + 1)::text::jsonb
        ),
        '{lastViewProcessed}',
        ${globalPosition}::text::jsonb
      )
      WHERE page_name = 'home'
      AND (page_data ->> 'lastViewProcessed')::int < ${globalPosition}::int
    `;
    return result;
  }

  async function ensureHomePage() {
    const initialData = {
      lastViewProcessed: 0,
      videosWatched: 0
    };
    const result = await db`
      INSERT INTO page(page_name, page_data)
      VALUES ('home', ${db.json(initialData)})
      ON CONFLICT DO NOTHING
    `;
    return result;
  }

  return {
    incrementVideosWatched,
    ensureHomePage
  };
}

function build({ db, messageStore }) {
  const queries = createQueries({ db });
  const handlers = createHandlers({ queries });
  const subscription = messageStore.createSubscription({
    streamName: "viewing",
    handlers,
    subscriberId: "aggregators:home-page"
  });

  function init() {
    return queries.ensureHomePage();
  }

  function start() {
    init().then(subscription.start);
  }

  return {
    queries,
    handlers,
    init,
    start
  };
}

module.exports = build;

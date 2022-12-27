var uuid = require('uuid');
var express = require('express');
var app = express();
var core = require('./core.js');
var key = "sus"
var db = {
  types: [
    {
      uuid: "0a8c820f-649d-4d75-b65f-010b31a228d1",
      atrr: { name: 'Zero' }
    },
  ],
  categories: [
    {
      uuid: "e483b920-59f5-42df-a2c0-f65c8a2f6a91",
      atrr: { name: 'Cat' }
    }
  ],
  rooms: [
    {
      uuid: "169e55db-d0ad-4c17-a17b-b15fe69a4aa9",
      atrr: { name: 'My Room' },
      containers: [
        {
          uuid: "9bc8c7d4-3810-4197-b91d-c0aff066b3ae",
          atrr: { name: 'Frist container' },
          containers: [
            {
              uuid: "c9c3604f-1170-47da-a931-ed6b3ae11e22",
              atrr: { name: 'Frist nested container' },
            }
          ]
        },
        {
          uuid: "84467141-bb4b-4058-8515-e5b432748de2",
          atrr: { name: 'Frist container', left: true, height: 20 },
          containers: [
            {
              uuid: "967f8b42-6637-4786-ad67-fc0514c5c2d1",
              atrr: { name: 'Frist nested container' },
            }
          ]
        }
      ]
    }
  ]
};
const port = 8080

app.get('/api/:key', (req, res) => {
  req.params.key !== key ? res.send(401) : res.send(db)
})
app.get('/api/:key/getfromuiid/:uuid', (req, res) => {
  let result;
  let type;
  if (result = core.findTypeByUuid(db, req.params.uuid)) {
    type = 'type'
  } else if (result = core.findCategoryByUuid(db, req.params.uuid)) {
    type = 'category'
  } else if (result = core.findContainerByUuid(db, req.params.uuid)) {
    type = 'container'
  } else {
    type = 'none'
    result = {};
  }
  res.send({ result: result, type: type })
})
app.get('/healtz', (req, res) => {
  res.send(200)
})
app.listen(port, () => {
  console.log(`Example app listening on localhost:${port}`)
})

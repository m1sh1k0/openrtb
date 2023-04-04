const fs = require('fs');
const { parser, schemas } = require('openrtb-schema-validator');
const ObjectsToCsv = require('objects-to-csv');

const requestValidator = parser(schemas.request['2.5'], {
  removeAdditional: true,
});

const file = fs.readFileSync('req.json');
const JSONreq = JSON.parse(file);

const ATTRIBUTES = [];

for (const req of JSONreq) {
  const SSP_ID = req.SspId;
  const OpenRtbReq = JSON.parse(req.OpenRtbReq);
  const { error } = requestValidator.validate(OpenRtbReq);
  if (error) {
    // Creating error row with defined attributes
    const ERROR = `${error._errors[0].keyword} ${error._errors[0].message}`;
    ATTRIBUTES.push({ SSP_ID, ERROR });
  }
}

(async () => {
  // Add count of errors
  for (const obj of ATTRIBUTES) {
    const count = ATTRIBUTES.filter((el) => {
      return el.ERROR === obj.ERROR && el.SSP_ID === obj.SSP_ID;
    }).length;
    obj.AMOUNT = count;
  }

  const csv = new ObjectsToCsv(ATTRIBUTES);
  // Save error to file
  await csv.toDisk('./errors.csv');
})();

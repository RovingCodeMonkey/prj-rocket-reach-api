import express from "express";
import apicache from "apicache";
import cors from "cors";
import axios from "axios";

let app = express();
let cache = apicache.middleware;

var port = process.env.PORT || 8080;

app.use(cors());
app.use(cache("5 minutes"));

app.get("/tumblr/:subdomain", (req, res, next) => {
  return axios
    .get(`https://${req.params.subdomain}.tumblr.com/api/read/json`)
    .then((response) => {
      let jsonpFixer = "{ success: false }";
      if (response) {
        jsonpFixer = response.data
          .replace("var tumblr_api_read = ", "")
          .replace(/;\s*$/g, "");
      }
      res.json(JSON.parse(jsonpFixer));
    })
    .catch((error) => {
      if (error.response.status == 404) {
        res
          .status(404)
          .json({ error: `${req.params.subdomain} was not found` });
      }
      res.status(500).json({ error: "An unexpected error has occurred" });
    });
});

app.listen(port);

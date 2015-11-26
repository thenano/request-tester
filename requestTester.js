var Promise = require('bluebird');
var request = Promise.promisify(require('request'));

function RequestTester() {
  function Request(options) {
    this.options = options;

    this.checkExpectedStatus = function () {};
    this.checkJSONResponse = function () {};

    this.expectedHeaders = {};
    this.expectedJSONs = [];

    this.headers = function (headers) {
      this.options.headers = headers;
      return this;
    };

    this.expectHeaderContains = function (header, content) {
      this.expectedHeaders[header] = content;
      return this;
    };

    this.expectStatus = function (statusCode) {
      this.checkExpectedStatus = function (response) {
        expect(response.statusCode).toBe(statusCode);
      };
      return this;
    };

    this.expectJSONContains = function (json) {
      this.expectedJSONs.push(json);
      return this;
    };

    this.expectJSON = function (json) {
      this.checkJSONResponse = function (response) {
        expect(JSON.parse(response.body)).toEqual(json);
      };
      return this;
    };

    this.checkExpectedHeaders = function (response) {
      for (var header in this.expectedHeaders) {
        if (typeof response.headers[header] !== 'undefined') {
          expect(response.headers[header]).toContain(this.expectedHeaders[header]);
        }
        else {
          expect(response.headers[header]).toBeDefined();
        }
      }
    };

    this.checkExpectedJSONs = function (response) {
      this.expectedJSONs.forEach(function (json) {
        expect(JSON.parse(response.body)).toContain(json);
      });
    };

    this.send = function () {
      return request(this.options).bind(this).spread(function (response) {
        this.checkExpectedStatus(response);
        this.checkJSONResponse(response);
        this.checkExpectedHeaders(response);
        this.checkExpectedJSONs(response);
        return response;
      });
    }
  };

  return {
    get: function (url) {
      return new Request({
        url: url,
        method: 'GET'
      });
    },

    post: function (url, body) {
      return new Request({
        url: url,
        method: 'POST',
        form: body
      });
    },

    put: function (url, body) {
      return new Request({
        url: url,
        method: 'PUT',
        form: body
      });
    },

    patch: function (url, body) {
      return new Request({
        url: url,
        method: 'PATCH',
        form: body
      });
    },

    options: function (url) {
      return new Request({
        url: url,
        method: 'OPTIONS'
      });
    }
  }
}

module.exports = RequestTester();
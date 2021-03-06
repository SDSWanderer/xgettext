var xgettext = require('..'),
  assert = require('assert'),
  gt = require('gettext-parser'),
  fs = require('fs'),
  path = require('path');

var tmpDir = path.resolve(__dirname + '/../tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

describe('API', function () {
  it('should run with default parameters', function (done) {
    xgettext(['test/fixtures/template.hbs'], function (po) {
      var context = gt.po.parse(po).translations[''];

      assert('Image description' in context);

      var comment = context['This is a fixed sentence'].comments;

      assert(comment.reference);
      assert.equal(comment.reference, 'test/fixtures/template.hbs:2');

      comment = context['Image description'].comments;

      assert(comment.reference.match('test/fixtures/template.hbs:5'));
      assert(comment.reference.match('test/fixtures/template.hbs:8'));

      done();
    });
  });
  it('should parse an empty template', function (done) {
    xgettext(['test/fixtures/fixed.hbs'], function (po) {
      assert(!po);

      done();
    });
  });
  it('should parse multiple files', function (done) {
    xgettext([
      'test/fixtures/template.hbs',
      'test/fixtures/dir/template.hbs',
      'test/fixtures/empty.hbs',
      'test/fixtures/fixed.hbs',
      'test/fixtures/repeat.hbs'
    ], null, function (po) {
      var context = gt.po.parse(po).translations[''];
      var str = JSON.stringify(context);

      assert(str.indexOf('test/fixtures/empty.hbs') < 0);
      assert(str.indexOf('test/fixtures/fixed.hbs') < 0);

      assert('Inside subdir' in context);

      var comment = context['This is a fixed sentence'].comments;

      assert(comment.reference.match('test/fixtures/template.hbs:2'));
      assert(comment.reference.match('test/fixtures/repeat.hbs:2'));

      done();
    });
  });
  it('should handle plural expressions', function (done) {
    xgettext(['test/fixtures/plural.hbs'], function (po) {
      var context = gt.po.parse(po).translations[''];

      assert(context !== undefined);
      assert.equal(context.quote.msgid_plural, 'quotes');
      assert.equal(context.quote.msgstr.length, 2);

      done();
    });
  });
  it('should handle non-ascii input', function (done) {
    xgettext(['test/fixtures/non-ascii.hbs'], function (po) {
      var context = gt.po.parse(po, 'utf-8').translations[''];

      assert('Строка' in context);

      done();
    });
  });
  it('should traverse a directory of input files', function (done) {
    xgettext(null, {
      directory: 'test/fixtures'
    }, function (po) {
      var context = gt.po.parse(po).translations[''];

      assert('Image description' in context);

      done();
    });
  });
  it('should write output to a file', function (done) {
    xgettext(['test/fixtures/template.hbs'], {
      output: 'tmp/output.po'
    }, function () {
      fs.readFile('tmp/output.po', 'utf8', function (err, data) {
        var context = gt.po.parse(data).translations[''];

        assert('Image description' in context);

        done();
      });
    });
  });
  it('should handle keywordspec', function (done) {
    xgettext(['test/fixtures/keyword.hbs'], {
      keyword: ['i18n', '$']
    }, function (po) {
      var context = gt.po.parse(po).translations[''];

      assert('Image description' in context);
      assert('regex escaped keyword' in context);

      xgettext(['test/fixtures/plural.hbs'], {
        keyword: ['i18n:1,2', 'order:2,3']
      }, function (po) {
        var context = gt.po.parse(po).translations[''];

        assert.equal(context.keyword.msgid_plural, 'keywords');
        assert.equal(context.difference.msgid_plural, 'differences');

        done();
      });
    });
  });
  it('should handle no-location option', function (done) {
    xgettext(['test/fixtures/repeat.hbs'], {
      'no-location': true
    }, function (po) {
      var context = gt.po.parse(po).translations[''];
      var comment = context['This is a fixed sentence'].comments || {};

      assert(comment.reference === undefined);

      done();
    });
  });
  it('should handle force-po option', function (done) {
    xgettext(['test/fixtures/fixed.hbs'], {
      'force-po': true
    }, function (po) {
      assert(po);

      done();
    });
  });
});

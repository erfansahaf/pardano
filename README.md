# Pardano Node.js Module

[![N|Solid](https://pardano.com/images/logo.png)](https://pardano.com)

[نسخه فارسی مستندات این پکیج](http://github.com/erfansahaf/pardano/blob/master/Fa.md)

Pardano is an Iranian website that provides online billing services and this module, helps you to use Pardano.ir Soap webservice easily and quickly in Node.js.


# Installation

You can install this package just like the others with NPM:

```sh
$ npm install pardano --save
```

# Usage

First of all, you should require pardano module and create an object of it:

```js
const Pardano = require('pardano');
const payment = new Pardan('YOUR API KEY');
```

Now you can access methods by `payment` constant.

# Methods

This package contains two methods. First, sendRequest which builds payment URL so you can create a hyperlink with payment URL action to redirect user to the bank payment page. Second, verifyRequest that can check transaction status and verify it.

## sendRequest:

As you've read before, this method builds payment url:

```js
app.get('/pardano', function (req, res) {
    payment.sendRequest(100, 'http://website.ir/pardano/verify', 1500, 'Description', function(err, link){
        if(err)
          res.end(err);
        else
          res.end("<html><body><a href='"+link+"'>Click to redirect</a></body></html>");
    });

});
```

First parameter is the amount of transaction that should be in Toman format.

Second is your callback URL, where you'll validate and verify transaction. When transaction successs or fails, user will redirect to this URL.

Third is order id or invoice number. It should be a number.

Fourth is the description which can be include product or transaction detail.

Fifth and the last one, is your callback function. This function has two input:

`err`: If there is any problem in URL building proccess, this one will be filled with error message. otherwise it will be null.

`link`: If everything goes on without problem, it will contains a bank payment link, otherwise will be null.

## verifyRequest:

To check transaction status, you can use this method:

```js
app.get('/pardano/verify', function(req, res){
    payment.verifyRequest(req, 100, function(success, message){
        if(success)
          res.end("Successfull");
        else
          res.end(message);
    });
});
```

First parameter is your web framework request object. This module uses this object to check the authority key.

Second one should be the same as you passed to `sendRequest` method to create payment URL.

Third is your callback function which has two input parameters:

`success`: A boolean input which indicates the status of the payment.

`message`: If `success` parameter is `false`, this parameter will contains an error message.

# Sample

If you need a sample code, you can take a look at `sample.js` file.

# License

This package is under Apache 2.0 license.
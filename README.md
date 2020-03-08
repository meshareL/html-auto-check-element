# &lt;auto-check&gt; Element
A form input validator

## Installation
```text
npm install tomoeed/html-auto-check-element --save
```

## Usage
```html
<auto-check href="/check" msg='{"typeMismatch": "type mismatch", "valueMismatch": "value mismatch", "all": "enter the correct email"}'>
    <label for="email">Email</label>
    <input id="email" name="email" required type="email">
</auto-check>
```

## Attributes
- `href` server endpoint
- `msg` validation message

## Events
- `auto-check:success`
- `auto-check:error`
- `auto-check:ajax-start` Server validation start
- `auto-check:ajax-end` Server validation completed
- `auto-check:ajax-success` Server validation success
- `auto-check:ajax-error` Server validation error

## License
Apache-2.0

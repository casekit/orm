# Reminders for documentation

## unsupported datatypes

the following datatypes are unsupported due to their input types being different to their output types.
this will be fixed in a future version of the library.

- interval
- point
- circle

## Releasing

```
pnpm build
pnpm -r exec npm version patch
pnpm publish -r
```





### grant/deny chaining API:

```
grant|deny access [when <cond>] [and|or <cond>...] [else fallback]
\_______________/                                                   permission
                        \________________________________________/  qualifier chain (initiator)
                                        \________________________/  qualifier chain (conjunct)
                    \______________________________________________/  'when' qualifier
                                \________________________________/  'and/or' qualifier
                                                    \_____________/  'else' qualifier
```

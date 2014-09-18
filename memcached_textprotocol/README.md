Memcached TextProtocol
======================
練習用のプロジェクトなので実際に使わないほうがいいです

# ToDo
getで入ってない時の処理 -> END


# COMMAND

## set,add,replace,append,prepend
<command> <key> <flags> <exptime> <bytes>\r\n
<data>\r\n

### response

```
STORED\r\n
```

## get
<command> <key>\r\n

### response

```
VALUE <key> <flags> <bytes>\r\n
<value>\r\n
END\r\n
```

## inc,dec
<command> <key> <value>\r\n

### response

```
<value>\r\n
```

## stats
<command>\r\n

### response

```
STAT <key> <value>\r\n
END\r\n
```

# errors

## error

## client_error


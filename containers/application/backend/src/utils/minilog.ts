const minilog = {
	i: (tag: string, msg: string) => minilog.log(tag, msg, 'INFO'),
  e: (tag: string, msg: string) => minilog.log(tag, msg, 'ERROR'),
  d: (tag: string, msg: string) => minilog.log(tag, msg, 'DEBUG'),
  w: (tag: string, msg: string) => minilog.log(tag, msg, 'WARN'),

  log: (tag: string, msg: string, level = 'INFO') => {
    process.stdout.write(JSON.stringify({
      "@timestamp": new Date().toISOString(),
      "level": level,
      "tag": tag.toUpperCase(),
      "message": msg
    }) + '\n');
  }
}

export default minilog

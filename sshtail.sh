while getopts "h:p:f:s:" arg
do
	case $arg in
		p)
			password="$OPTARG"
			;;
		h)
			host="$OPTARG"
			;;
		f)
			file="$OPTARG"
			;;
		s)	
			service="$OPTARG"
			;;
	esac
done

if [ -z "$password" ] || [ -z "$host" ] || [ -z "$file" ] || [ -z "$service" ]; then 
	echo "param error."
	exit 1
fi

echo "start sshpass $host $service"
sshpass -p "$password" ssh "$host" "start=\`date +%s\`;stop=0;count=0;LOG_COUNT_FILE=\`mktemp -t tailit.logcount.XXXXXX\`;LOG_FILE=\` mktemp -t tailit.log.XXXXXX\` || NO_CACHE=1; echo \"\$LOG_FILE\"; tail -f $file | while read line; do ((count++));echo \$count > \$LOG_COUNT_FILE; cmd=\"{ sleep 3; last=\\\`cat \$LOG_COUNT_FILE\\\`;line=\\\"[\\\$count] \\\$line\\\"; echo \\\$line; now=\\\`date +%s\\\`; if ((\\\$count == \\\$last)) || ((\\\$count % 100 == 0)) ; then content=\\\`cat \$LOG_FILE\\\`; echo \\\"\\\" > \$LOG_FILE; content=\\\`echo -e \\\"content=\\\$content\\\\n\\\$line\\\"\\\`; echo \\\$content; curl --data-urlencode \\\"\\\$content\\\" '$service'; else echo \\\"\\\$content\\\$line\\\" >> \$LOG_FILE;fi; }&\";eval \$cmd;if ((\`date +%s\` > \$start + 1200)); then pkill -P \$\$ tail; fi; done;echo \"expired\";"
#original script
#start=\`date +%s\`;stop=0;count=0;LOG_COUNT_FILE=\`mktemp -t tailit.logcount.XXXXXX\`;LOG_FILE=\` mktemp -t tailit.log.XXXXXX\` || NO_CACHE=1; echo \"\$LOG_FILE\"; tail -f $file | while read line; do ((count++));echo \$count > \$LOG_COUNT_FILE; cmd=\"{ sleep 3; last=\\\`cat \$LOG_COUNT_FILE\\\`;line=\\\"[\\\$count] \\\$line\\\"; echo \\\$line; now=\\\`date +%s\\\`; if ((\\\$count == \\\$last)) || ((\\\$count % 100 == 0)) ; then content=\\\`cat \$LOG_FILE\\\`; echo \\\"\\\" > \$LOG_FILE; content=\\\`echo -e \\\"content=\\\$content\\\\n\\\$line\\\"\\\`; echo \\\$content; curl --data-urlencode \\\"\\\$content\\\" '$service'; else echo \\\"\\\$content\\\$line\\\" >> \$LOG_FILE;fi; }&\";eval \$cmd;if ((\`date +%s\` > \$start + 1200)); then pkill -P \$\$ tail; fi; done;echo \"expired\";

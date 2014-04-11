while getopts "h:p:f:" arg
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
	esac
done

echo "$password $host $file"
if [ -z "$password" ] || [ -z "$host" ] || [ -z "$file" ]; then 
	echo "param error."; 
	exit 1; 
fi;

sshpass -p "$password" ssh "$host" "content=\"\";start=\`date +%s\`;timestop=\$start;tail -f '$file' | while read line; do content=\"\$content\$line\r\n\"; now=\`date +%s\`; if ((\$now > \$timestop+3)); then timestop=\$now; curl --data-urlencode \"content=\$content\" \"http://cq01-rdqa-dev074.cq01.baidu.com:8999/testlog\"; content=\"\";fi;if ((\`date +%s\` > \$start + 600)); then pkill -P \$\$ tail; fi;done;echo \"expired\";"

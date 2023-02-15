find . -name "*.json" -exec gsed -i "s/\"id\": \"[[:alnum:]]\{32\}\"/\"id\": \"\"/g" {} +

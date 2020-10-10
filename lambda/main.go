package main

import (
	"fmt"

	"github.com/aws/aws-lambda-go/lambda"
)

func HandleRequest() (string, error) {
	return fmt.Sprint("Hello, World!"), nil
}

func main() {
	lambda.Start(HandleRequest)
}

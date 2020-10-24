package main

import (
	"encoding/json"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func routeRequest(request events.APIGatewayWebsocketProxyRequest) (response events.APIGatewayProxyResponse, err error) {
	printObj(request)

	if request.RequestContext.RouteKey == "$connect" {
		response, err = handleConnect(request)
	} else if request.RequestContext.RouteKey == "$disconnect" {
		response, err = handleDisconnect(request)
	} else {
		response = events.APIGatewayProxyResponse{
			StatusCode: 400,
			Body:       "Bad Request",
		}
	}

	printObj(response)
	return response, err
}

func printObj(v interface{}) {
	bytes, _ := json.Marshal(v)
	fmt.Println(string(bytes))
}

func main() {
	lambda.Start(routeRequest)
}

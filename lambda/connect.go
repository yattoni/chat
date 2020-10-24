package main

import (
	"fmt"

	"github.com/aws/aws-lambda-go/events"
)

func handleConnect(request events.APIGatewayWebsocketProxyRequest) (events.APIGatewayProxyResponse, error) {
	connectionID := request.RequestContext.ConnectionID
	body := fmt.Sprintf("Hello, %s", connectionID)
	fmt.Println(body)
	response := events.APIGatewayProxyResponse{
		StatusCode: 200,
		Body:       body,
	}
	return response, nil
}

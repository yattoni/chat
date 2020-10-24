package main

import (
	"fmt"

	"github.com/aws/aws-lambda-go/events"
)

func handleDisconnect(request events.APIGatewayWebsocketProxyRequest) (events.APIGatewayProxyResponse, error) {
	connectionID := request.RequestContext.ConnectionID
	body := fmt.Sprintf("Goodbye, %s", connectionID)
	fmt.Println(body)
	response := events.APIGatewayProxyResponse{
		StatusCode: 200,
		Body:       body,
	}
	return response, nil
}

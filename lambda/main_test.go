package main

import (
	"testing"

	"github.com/aws/aws-lambda-go/events"
)

func TestRouteRequest_Connect(t *testing.T) {
	actual, _ := routeRequest(events.APIGatewayWebsocketProxyRequest{
		RequestContext: events.APIGatewayWebsocketProxyRequestContext{
			RouteKey:     "$connect",
			ConnectionID: "12345",
		},
	})
	expectedStatusCode := 200
	if actual.StatusCode != 200 {
		t.Errorf("routeRequest() StatusCode = %d; wanted %d", actual.StatusCode, expectedStatusCode)
	}
	expectedBody := "Hello, 12345"
	if actual.Body != expectedBody {
		t.Errorf("routeRequest() Body = '%s'; wanted '%s'", actual.Body, expectedBody)
	}
}

func TestRouteRequest_Disconnect(t *testing.T) {
	actual, _ := routeRequest(events.APIGatewayWebsocketProxyRequest{
		RequestContext: events.APIGatewayWebsocketProxyRequestContext{
			RouteKey:     "$disconnect",
			ConnectionID: "12345",
		},
	})
	expectedStatusCode := 200
	if actual.StatusCode != 200 {
		t.Errorf("routeRequest() StatusCode = %d; wanted %d", actual.StatusCode, expectedStatusCode)
	}
	expectedBody := "Goodbye, 12345"
	if actual.Body != expectedBody {
		t.Errorf("routeRequest() Body = '%s'; wanted '%s'", actual.Body, expectedBody)
	}
}

func TestRouteRequest_BadRoute(t *testing.T) {
	actual, _ := routeRequest(events.APIGatewayWebsocketProxyRequest{
		RequestContext: events.APIGatewayWebsocketProxyRequestContext{
			RouteKey: "bad route",
		},
	})
	expectedStatusCode := 400
	if actual.StatusCode != 400 {
		t.Errorf("routeRequest() StatusCode = %d; wanted %d", actual.StatusCode, expectedStatusCode)
	}
	expectedBody := "Bad Request"
	if actual.Body != expectedBody {
		t.Errorf("routeRequest() Body = '%s'; wanted '%s'", actual.Body, expectedBody)
	}
}

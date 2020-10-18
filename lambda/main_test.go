package main

import "testing"

func TestHandleRequest(t *testing.T) {
	actual, _ := HandleRequest()
	if actual.StatusCode != 200 {
		t.Errorf("HandleRequest() StatusCode = %d; wanted 200", actual.StatusCode)
	}
	if actual.Body != "Hello, World!" {
		t.Errorf("HandleRequest() Body = '%s'; wanted 'Hello, World!'", actual.Body)
	}
}

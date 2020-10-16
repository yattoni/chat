package main

import "testing"

func TestHandleRequest(t *testing.T) {
	actual, _ := HandleRequest()
	if actual != "Hello, World!!!!!" {
		t.Errorf("HandleRequest() = %s; wanted Hello, World!", actual)
	}
}

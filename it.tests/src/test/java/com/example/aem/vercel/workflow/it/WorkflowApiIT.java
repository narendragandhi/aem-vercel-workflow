package com.example.aem.vercel.workflow.it;

import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

class WorkflowApiIT {

    private static final String AUTHOR_URL = System.getProperty("it.author.url", "http://localhost:4502");
    private static final String USERNAME = System.getProperty("it.author.username", "admin");
    private static final String PASSWORD = System.getProperty("it.author.password", "admin");

    @Test
    void workflowsEndpointResponds() throws Exception {
        HttpClient client = HttpClient.newBuilder()
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

        if (!isAemReachable(client)) {
            Assumptions.abort("AEM author not reachable at " + AUTHOR_URL);
        }

        HttpResponse<String> response = client.send(
            buildRequest("/bin/workflows"),
            HttpResponse.BodyHandlers.ofString()
        );

        if (response.statusCode() == 403) {
            Assumptions.abort("RBAC blocks user; add user to aemflow-admin to run this test");
        }

        Assertions.assertThat(response.statusCode()).isEqualTo(200);
    }

    private boolean isAemReachable(HttpClient client) throws Exception {
        HttpResponse<String> response = client.send(
            buildRequest("/system/console/status-productinfo.json"),
            HttpResponse.BodyHandlers.ofString()
        );
        return response.statusCode() == 200;
    }

    private HttpRequest buildRequest(String path) {
        String auth = Base64.getEncoder()
            .encodeToString((USERNAME + ":" + PASSWORD).getBytes(StandardCharsets.UTF_8));

        return HttpRequest.newBuilder()
            .uri(URI.create(AUTHOR_URL + path))
            .header("Authorization", "Basic " + auth)
            .header("Accept", "application/json")
            .GET()
            .build();
    }
}

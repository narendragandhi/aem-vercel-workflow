package com.example.aem.vercel.workflow.servlet;

import com.example.aem.vercel.workflow.model.WorkflowDefinitionModel;
import com.example.aem.vercel.workflow.service.AuditLogService;
import com.example.aem.vercel.workflow.service.AuthorizationService;
import com.example.aem.vercel.workflow.service.WorkflowDefinitionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.servlets.SlingAllMethodsServlet;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

import javax.servlet.Servlet;
import javax.servlet.ServletException;
import java.io.IOException;

@Component(
    service = Servlet.class,
    property = {
        "sling.servlet.paths=/bin/workflows",
        "sling.servlet.methods={GET,POST,PUT,DELETE}"
    }
)
public class WorkflowApiServlet extends SlingAllMethodsServlet {

    @Reference
    private WorkflowDefinitionService workflowDefinitionService;

    @Reference
    private AuthorizationService authorizationService;

    @Reference
    private AuditLogService auditLogService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doGet(SlingHttpServletRequest request, SlingHttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            if (!authorizationService.canRead(request.getResourceResolver())) {
                response.setStatus(SlingHttpServletResponse.SC_FORBIDDEN);
                response.getWriter().write("{\"error\":\"Forbidden\"}");
                return;
            }

            String id = request.getParameter("id");
            if (id != null && !id.isEmpty()) {
                workflowDefinitionService.getWorkflow(id)
                    .ifPresentOrElse(
                        workflow -> {
                            try {
                                response.getWriter().write(objectMapper.writeValueAsString(workflow));
                            } catch (IOException e) {
                                throw new RuntimeException(e);
                            }
                        },
                        () -> {
                            response.setStatus(SlingHttpServletResponse.SC_NOT_FOUND);
                        }
                    );
            } else {
                response.getWriter().write(objectMapper.writeValueAsString(workflowDefinitionService.getAllWorkflows()));
            }
        } catch (Exception e) {
            response.setStatus(SlingHttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    @Override
    protected void doPost(SlingHttpServletRequest request, SlingHttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            if (!authorizationService.canWrite(request.getResourceResolver())) {
                response.setStatus(SlingHttpServletResponse.SC_FORBIDDEN);
                response.getWriter().write("{\"error\":\"Forbidden\"}");
                return;
            }

            WorkflowDefinitionModel workflow = objectMapper.readValue(request.getReader(), WorkflowDefinitionModel.class);
            WorkflowDefinitionModel createdWorkflow = workflowDefinitionService.createWorkflow(workflow);
            response.getWriter().write(objectMapper.writeValueAsString(createdWorkflow));
            response.setStatus(SlingHttpServletResponse.SC_CREATED);

            auditLogService.logEvent(
                request.getResourceResolver().getUserID(),
                "workflow.create",
                createdWorkflow.getId(),
                "success",
                java.util.Map.of("name", createdWorkflow.getName())
            );
        } catch (Exception e) {
            response.setStatus(SlingHttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    @Override
    protected void doPut(SlingHttpServletRequest request, SlingHttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            if (!authorizationService.canWrite(request.getResourceResolver())) {
                response.setStatus(SlingHttpServletResponse.SC_FORBIDDEN);
                response.getWriter().write("{\"error\":\"Forbidden\"}");
                return;
            }

            String id = request.getParameter("id");
            if (id == null || id.isEmpty()) {
                response.setStatus(SlingHttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"error\":\"Workflow ID is required for update\"}");
                return;
            }

            WorkflowDefinitionModel workflow = objectMapper.readValue(request.getReader(), WorkflowDefinitionModel.class);
            WorkflowDefinitionModel updatedWorkflow = workflowDefinitionService.updateWorkflow(id, workflow);
            response.getWriter().write(objectMapper.writeValueAsString(updatedWorkflow));

            auditLogService.logEvent(
                request.getResourceResolver().getUserID(),
                "workflow.update",
                updatedWorkflow.getId(),
                "success",
                java.util.Map.of("name", updatedWorkflow.getName())
            );
        } catch (Exception e) {
            response.setStatus(SlingHttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    @Override
    protected void doDelete(SlingHttpServletRequest request, SlingHttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            if (!authorizationService.canWrite(request.getResourceResolver())) {
                response.setStatus(SlingHttpServletResponse.SC_FORBIDDEN);
                response.getWriter().write("{\"error\":\"Forbidden\"}");
                return;
            }

            String id = request.getParameter("id");
            if (id == null || id.isEmpty()) {
                response.setStatus(SlingHttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"error\":\"Workflow ID is required for delete\"}");
                return;
            }

            if (workflowDefinitionService.deleteWorkflow(id)) {
                response.setStatus(SlingHttpServletResponse.SC_NO_CONTENT);
                auditLogService.logEvent(
                    request.getResourceResolver().getUserID(),
                    "workflow.delete",
                    id,
                    "success",
                    java.util.Map.of()
                );
            } else {
                response.setStatus(SlingHttpServletResponse.SC_NOT_FOUND);
            }
        } catch (Exception e) {
            response.setStatus(SlingHttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
}

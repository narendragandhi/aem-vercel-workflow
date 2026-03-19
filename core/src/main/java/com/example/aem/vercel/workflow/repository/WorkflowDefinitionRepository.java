package com.example.aem.vercel.workflow.repository;

import com.example.aem.vercel.workflow.model.WorkflowDefinitionModel;

import java.util.List;
import java.util.Optional;

public interface WorkflowDefinitionRepository {
    WorkflowDefinitionModel create(WorkflowDefinitionModel workflow);

    WorkflowDefinitionModel update(String id, WorkflowDefinitionModel workflow);

    Optional<WorkflowDefinitionModel> get(String id);

    List<WorkflowDefinitionModel> list();

    boolean delete(String id);
}

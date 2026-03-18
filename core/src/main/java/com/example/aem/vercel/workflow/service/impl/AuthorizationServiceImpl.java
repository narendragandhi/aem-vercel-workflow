package com.example.aem.vercel.workflow.service.impl;

import com.example.aem.vercel.workflow.service.AuthorizationService;
import org.apache.jackrabbit.api.security.user.Authorizable;
import org.apache.jackrabbit.api.security.user.Group;
import org.apache.jackrabbit.api.security.user.UserManager;
import org.apache.sling.api.resource.ResourceResolver;
import org.osgi.service.component.annotations.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.RepositoryException;

@Component(service = AuthorizationService.class)
public class AuthorizationServiceImpl implements AuthorizationService {

    private static final Logger LOG = LoggerFactory.getLogger(AuthorizationServiceImpl.class);

    private static final String GROUP_ADMIN = "aemflow-admin";
    private static final String GROUP_AUTHOR = "aemflow-author";

    @Override
    public boolean canRead(ResourceResolver resourceResolver) {
        return isMember(resourceResolver, GROUP_ADMIN) || isMember(resourceResolver, GROUP_AUTHOR);
    }

    @Override
    public boolean canWrite(ResourceResolver resourceResolver) {
        return isMember(resourceResolver, GROUP_ADMIN);
    }

    private boolean isMember(ResourceResolver resourceResolver, String groupId) {
        try {
            UserManager userManager = resourceResolver.adaptTo(UserManager.class);
            if (userManager == null) {
                LOG.warn("UserManager not available for authorization checks");
                return false;
            }

            String userId = resourceResolver.getUserID();
            if (userId == null || userId.isEmpty()) {
                return false;
            }

            Authorizable authorizable = userManager.getAuthorizable(userId);
            if (authorizable == null) {
                return false;
            }

            Authorizable groupAuth = userManager.getAuthorizable(groupId);
            if (!(groupAuth instanceof Group group)) {
                return false;
            }

            return group.isMember(authorizable);
        } catch (RepositoryException e) {
            LOG.error("Failed to check group membership for {}", groupId, e);
            return false;
        }
    }
}

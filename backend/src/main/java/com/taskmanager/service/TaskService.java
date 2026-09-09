package com.taskmanager.service;

import com.taskmanager.dto.TaskRequest;
import com.taskmanager.model.Task;
import com.taskmanager.repository.TaskRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository repository;

    public TaskService(TaskRepository repository) {
        this.repository = repository;
    }

    public List<Task> findAll() {
        return repository.findAll();
    }

    public Task findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
    }

    public Task create(TaskRequest req) {
        Task task = new Task();
        task.setTitle(req.getTitle());
        task.setDescription(req.getDescription());
        String status = normalizeStatus(req.getStatus(), "PENDING");
        task.setStatus(status);
        return repository.save(task);
    }

    public Task update(Long id, TaskRequest req) {
        Task task = findById(id);
        if (req.getTitle() != null && !req.getTitle().isBlank()) {
            task.setTitle(req.getTitle());
        }
        if (req.getDescription() != null) {
            task.setDescription(req.getDescription());
        }
        if (req.getStatus() != null) {
            task.setStatus(normalizeStatus(req.getStatus(), task.getStatus()));
        }
        return repository.save(task);
    }

    public void delete(Long id) {
        Task task = findById(id);
        repository.delete(task);
    }

    private String normalizeStatus(String status, String fallback) {
        if (status == null || status.isBlank()) return fallback;
        String upper = status.toUpperCase();
        if (!upper.equals("PENDING") && !upper.equals("COMPLETED")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status must be PENDING or COMPLETED");
        }
        return upper;
    }
}

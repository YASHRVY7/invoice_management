import { Component, OnInit } from '@angular/core';
import { Admin } from '../admin';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface AdminUsersResponse {
  total: number;
  users: Array<{
    id: number;
    username: string;
    email: string;
    role: string;
    isActive: boolean;
  }>;
}

interface AdminLogsResponse {
  logs: Array<{
    id?: number;
    action: string;
    user: string;
    date: string | Date;
  }>;
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  totalUsers = 0;
  activeUsers = 0;
  adminUsers = 0;
  users: AdminUsersResponse['users'] = [];
  logs: AdminLogsResponse['logs'] = [];
  loadingUsers = true;
  loadingLogs = true;
  lastUpdated?: Date;
  removingUserId: number | null = null;

  constructor(private admin: Admin) { }

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.fetchUsers();
    this.fetchLogs();
  }

  private fetchUsers() {
    this.loadingUsers = true;
    this.admin.getUsers().subscribe({
      next: (res: AdminUsersResponse) => {
        this.totalUsers = res.total ?? 0;
        this.users = res.users ?? [];
        this.activeUsers = this.users.filter(user => user.isActive).length;
        this.adminUsers = this.users.filter(user => (user.role || '').toLowerCase() === 'admin').length;
        this.lastUpdated = new Date();
        this.loadingUsers = false;
      },
      error: () => {
        this.users = [];
        this.totalUsers = 0;
        this.activeUsers = 0;
        this.adminUsers = 0;
        this.loadingUsers = false;
      },
    });
  }

  private fetchLogs() {
    this.loadingLogs = true;
    this.admin.getLogs().subscribe({
      next: (res: AdminLogsResponse) => {
        this.logs = res.logs ?? [];
        this.loadingLogs = false;
      },
      error: () => {
        this.logs = [];
        this.loadingLogs = false;
      },
    });
  }

  deleteUser(userId: number) {
    if (this.removingUserId === userId) {
      return;
    }

    const shouldRemove = confirm('Are you sure you want to remove this user?');
    if (!shouldRemove) {
      return;
    }

    this.removingUserId = userId;
    this.admin.removeUser(userId).subscribe({
      next: () => {
        this.users = this.users.filter((user) => user.id !== userId);
        this.totalUsers = this.users.length;
        this.activeUsers = this.users.filter((user) => user.isActive).length;
        this.adminUsers = this.users.filter((user) => (user.role || '').toLowerCase() === 'admin').length;
        this.removingUserId = null;
      },
      error: () => {
        this.removingUserId = null;
      },
    });
  }

  trackByUserId(index: number, user: { id: number }) {
    return user.id;
  }

  trackByLog(index: number, log: { id?: number; date: string | Date }) {
    return log.id ?? index;
  }
}


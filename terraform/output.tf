
output "argocd_admin_username" {
  value = "admin"
}

output "argocd_admin_password" {
  value     = data.kubernetes_secret.argocd_initial_admin.data["password"]
  sensitive = true
}

output "argocd_url" {
  value = "https://localhost:8080"
}

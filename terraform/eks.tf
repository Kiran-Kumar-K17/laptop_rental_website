module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "21.29.0"

  name               = local.name
  kubernetes_version = "1.35"

  endpoint_public_access  = true
  endpoint_private_access = true

  # Optional: Adds the current caller identity as an administrator via cluster access entry
  enable_cluster_creator_admin_permissions = true

  addons = {
    coredns={
        most_recent=true
    }
    kube-proxy={
        most_recent=true
    }
    vpc-cni={
        most_recent=true
        before_compute = true
    }
  }

 # Networking
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
  control_plane_subnet_ids = module.vpc.intra_subnets

  # Managed Node Groups
  eks_managed_node_groups = {
    laptop_rental = {
      min_size     = 2
      max_size     = 3
      desired_size = 2

      instance_types = ["t3.medium"]
      capacity_type  = "SPOT"

      tags = {
        ExtraTag = "MyEKS"
      }
    }
  }

  tags = local.tags
}

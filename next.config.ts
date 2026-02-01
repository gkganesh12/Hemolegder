import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Externalize packages that have native dependencies or protobuf issues
  serverExternalPackages: [
    'fabric-network',
    'fabric-ca-client',
    'fabric-common',
    'fabric-protos',
    '@grpc/grpc-js',
  ],
};

export default nextConfig;

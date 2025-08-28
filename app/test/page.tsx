"use client"

import { RoleTest } from "@/components/test/role-test"

export default function TestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Role-Based Access Control Test</h1>
      <RoleTest />
    </div>
  )
}

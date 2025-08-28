import { supabase } from './supabase';

export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/confirm-email`
    },
  });
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getUser() {
  return supabase.auth.getUser();
}

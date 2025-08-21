import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    name: string;
    email: string;
};

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();
    const inputFileRef = useRef<HTMLInputElement | null>(null);
    const formRef = useRef<HTMLFormElement | null>(null);
    const [avatarSubmitted, setAvatarSubmitted] = useState<boolean | null>(null);
    const [avatarDeleteProcessing, setAvatarDeleteProcessing] = useState<boolean | false>(false);

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<ProfileForm>>({
        name: auth.user.name,
        email: auth.user.email,
    });

    // useForm for avatar
    const {
        data: avatarData,
        setData: setAvatarData,
        post: postAvatar,
        errors: postErrors,
        processing: avatarProcessing,
        clearErrors,
    } = useForm<{ avatar: File | null }>({
        avatar: null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    // Avatar Changing logic
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (!file) return;

        clearErrors(); // remove previous errors
        setAvatarSubmitted(false); // reset first
        setTimeout(() => {
            setAvatarData({ avatar: file });
            setAvatarSubmitted(true);
        }, 0);
    };

    useEffect(() => {
        if (avatarSubmitted) {
            if (!avatarData.avatar) return;

            postAvatar(route('profile.updateAvatar'), {
                forceFormData: true,
                onSuccess: () => {
                    setAvatarSubmitted(false);
                    setAvatarData({ avatar: null });
                },
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [avatarSubmitted]);

    // Avatar Deleting logic
    const handleAvatarDelete = () => {
        setAvatarDeleteProcessing(true);

        // Send POST request to delete avatar
        postAvatar(route('profile.deleteAvatar'), {
            onFinish: () => {
                setAvatarDeleteProcessing(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="Update your name and email address" />

                    <div className="flex items-end gap-5">
                        <Avatar className="size-12 overflow-hidden rounded-full">
                            <AvatarImage src={`/avatars/${auth.user.avatar_path}`} alt={auth.user.name} />
                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                {getInitials(auth.user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex gap-3">
                            {/* Avatar change btn */}
                            <form ref={formRef}>
                                <input type="file" id="avatar" ref={inputFileRef} className="hidden" onChange={handleAvatarChange} />

                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={avatarProcessing}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        inputFileRef.current?.click();
                                    }}
                                >
                                    Change avatar
                                </Button>
                            </form>

                            {/* Avatar delete btn */}
                            <Button
                                variant="destructive"
                                size="sm"
                                disabled={avatarDeleteProcessing || auth.user.avatar_path === null}
                                onClick={handleAvatarDelete}
                            >
                                Delete avatar
                            </Button>
                        </div>
                    </div>

                    {/* Modifing avatar errors */}
                    {Object.values(postErrors).length > 0 && (
                        <div className="-mt-2">
                            {Object.values(postErrors).map((err, i) => (
                                <p key={i} className="text-sm text-destructive-foreground">
                                    {err}
                                </p>
                            ))}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Full name"
                            />

                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />

                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="-mt-4 text-sm text-muted-foreground">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        Click here to resend the verification email.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}

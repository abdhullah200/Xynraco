import React from 'react';
import Image from 'next/image';

interface EmptyStateProps {
    title: string;
    description: string;
    imageSrc?: string;
}

const EmptyState = ({ title, description, imageSrc = "/empty-state.svg" }: EmptyStateProps) => {
    return(
        <div className="flex flex-col items-center justify-center py-16">
            <Image src={imageSrc!} alt={title} className="w-48 h-48 mb-4" height={192} width={192}/>
            <h2 className="text-xl font-semibold text-gray-500">
                {title}
            </h2>
            <p className="text-gray-400">
                {description}
            </p>
        </div>
    )
}
export default EmptyState;
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'AI动作分析 - MoveChecker',
    description: '上传你的运动视频，获得AI驱动的专业动作分析和改进建议',
};

export default function AnalysisLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}

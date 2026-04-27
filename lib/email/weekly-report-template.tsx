import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Section,
  Hr,
} from '@react-email/components';

interface ChildSummary {
  name: string;
  sessions: number;
  starsEarned: number;
  accuracy: number;
  streakDays: number;
}

interface Props {
  parentName: string;
  children: ChildSummary[];
  unsubscribeUrl: string;
}

export function WeeklyReportTemplate({ parentName, children, unsubscribeUrl }: Props) {
  return (
    <Html lang="en">
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9fafb', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '480px', margin: '32px auto', backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px' }}>
          <Heading style={{ color: '#1d4ed8', fontSize: '24px', marginBottom: '8px' }}>
            Weekly Progress Report
          </Heading>
          <Text style={{ color: '#6b7280', fontSize: '14px', marginTop: 0 }}>
            Hi {parentName || 'there'}! Here&apos;s how your little learners did this week.
          </Text>
          <Hr style={{ margin: '24px 0', borderColor: '#e5e7eb' }} />
          {children.map((child, i) => (
            <Section key={i} style={{ marginBottom: '24px' }}>
              <Heading as="h2" style={{ color: '#374151', fontSize: '18px', marginBottom: '12px' }}>
                {child.name}
              </Heading>
              <Text style={{ color: '#374151', fontSize: '14px', margin: '4px 0' }}>
                Sessions completed: <strong>{child.sessions}</strong>
              </Text>
              <Text style={{ color: '#374151', fontSize: '14px', margin: '4px 0' }}>
                Stars earned: <strong>{child.starsEarned}</strong>
              </Text>
              <Text style={{ color: '#374151', fontSize: '14px', margin: '4px 0' }}>
                Accuracy: <strong>{child.accuracy}%</strong>
              </Text>
              <Text style={{ color: '#374151', fontSize: '14px', margin: '4px 0' }}>
                Day streak: <strong>{child.streakDays}</strong>
              </Text>
            </Section>
          ))}
          <Hr style={{ margin: '24px 0', borderColor: '#e5e7eb' }} />
          <Text style={{ color: '#9ca3af', fontSize: '12px', textAlign: 'center' as const }}>
            <a href={unsubscribeUrl} style={{ color: '#9ca3af' }}>Unsubscribe</a> from weekly reports
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

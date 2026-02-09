import React from 'react';
import { Card, CardActionArea, Box, Typography } from '@mui/material';

const StatCard = ({
  icon,
  title,
  value,
  subtitle,
  color = 'primary',
  onClick,
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        borderLeft: '4px solid',
        borderLeftColor: `${color}.main`,
        transition: 'box-shadow 0.3s, transform 0.2s',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          {/* Icon Circle */}
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `${color}.light`,
              color: `${color}.contrastText`,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>

          {/* Text Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                mb: 0.5,
              }}
            >
              {value}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: 'text.secondary',
                mb: subtitle ? 0.25 : 0,
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
};

export default StatCard;

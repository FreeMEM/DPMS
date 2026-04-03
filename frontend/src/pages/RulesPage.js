import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Table,
  TableBody,
  TableRow,
  TableCell,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Gavel as GavelIcon,
  Computer as ComputerIcon,
  EmojiEvents as TrophyIcon,
  Description as DocIcon,
  CheckCircleOutline as CheckIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { editionsAPI } from '../services/api';
import MainBar from '../@dpms-freemem/MainBar';
import ThreeBackground from '../components/common/ThreeBackground';
import BackgroundToggle from '../components/common/BackgroundToggle';

// Simple markdown renderer for compo rules (supports ##, **, -, \n)
const SimpleMarkdown = ({ children }) => {
  if (!children) return null;
  const lines = children.split('\n');
  const elements = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <Box component="ul" key={`ul-${elements.length}`} sx={{ pl: 2, my: 0.5 }}>
          {listItems.map((item, i) => (
            <Typography component="li" key={i} variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }}
            />
          ))}
        </Box>
      );
      listItems = [];
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) { flushList(); return; }

    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <Typography key={i} variant="subtitle1" fontWeight={600} sx={{ mt: elements.length > 0 ? 2 : 0, mb: 0.5 }}>
          {trimmed.replace('## ', '')}
        </Typography>
      );
    } else if (trimmed.startsWith('- ')) {
      listItems.push(trimmed.replace('- ', ''));
    } else {
      flushList();
      elements.push(
        <Typography key={i} variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 0.5 }}
          dangerouslySetInnerHTML={{ __html: trimmed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }}
        />
      );
    }
  });
  flushList();

  return <Box>{elements}</Box>;
};

const MachineSpecsTable = ({ title, specs }) => (
  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
    <Typography variant="subtitle1" fontWeight={600} gutterBottom>{title}</Typography>
    <Table size="small" sx={{ '& td, & th': { border: 0, py: 0.5 } }}>
      <TableBody>
        {specs.map(([label, value]) => (
          <TableRow key={label}>
            <TableCell sx={{ fontWeight: 500, width: 160, pl: 0 }}>{label}</TableCell>
            <TableCell>{value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Paper>
);

const RulesPage = () => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState('general');
  const [editions, setEditions] = useState([]);
  const [selectedEdition, setSelectedEdition] = useState(null);
  const [compos, setCompos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    editionsAPI.list({ public: true })
      .then(res => {
        const list = res.data || [];
        setEditions(list);
        if (list.length > 0) {
          const open = list.find(e => e.open_to_upload);
          setSelectedEdition(open?.id || list[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fetchCompos = useCallback(async (editionId) => {
    if (!editionId) return;
    try {
      setLoading(true);
      const res = await editionsAPI.getCompos(editionId);
      setCompos(res.data || []);
    } catch {
      setCompos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedEdition) fetchCompos(selectedEdition);
  }, [selectedEdition, fetchCompos]);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Compos that have rules
  const composWithRules = compos.filter(hc => hc.compo_rules && hc.compo_rules.trim());

  // Need OCS/AGA machine specs?
  const needsOCS = compos.some(hc => {
    const n = hc.compo_name;
    return n.includes('OCS') || n === 'Oldschool Demo' || n.includes('Bootblock');
  });
  const needsAGA = compos.some(hc => {
    const n = hc.compo_name;
    return n.includes('AGA') || n === 'Executable Music';
  });

  return (
    <Box sx={{ display: 'flex' }}>
      <ThreeBackground variant="user" />
      <BackgroundToggle />
      <MainBar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8, ml: { sm: '64px' }, position: 'relative', zIndex: 1 }}>
        <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 1, sm: 3 } }}>

          <Typography variant="h4" gutterBottom fontWeight={700}>
            {t("Competition Rules")}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {t("Rules and specifications for the competitions in the selected edition. Please read carefully before submitting your production.")}
          </Typography>

          {/* Edition selector */}
          {editions.length > 0 && (
            <ToggleButtonGroup
              value={selectedEdition}
              exclusive
              onChange={(e, val) => { if (val !== null) setSelectedEdition(val); }}
              sx={{
                mb: 3,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                '& .MuiToggleButtonGroup-grouped': {
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '20px !important',
                  px: 2,
                  py: 0.75,
                  textTransform: 'none',
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    borderColor: 'primary.main',
                    '&:hover': { bgcolor: 'primary.dark' },
                  },
                },
              }}
            >
              {editions.map((edition) => (
                <ToggleButton key={edition.id} value={edition.id}>
                  {edition.title}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : compos.length === 0 ? (
            <Alert severity="info">
              {t("No competitions configured for this edition yet.")}
            </Alert>
          ) : (
            <>
              {/* Remote participation */}
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight={600}>
                  {t("REMOTE PARTICIPATION IS ALLOWED.")}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t("If a remote production wins a prize, the organization cannot cover shipping costs. The winner may need to arrange pickup through an attendee.")}
                </Typography>
              </Alert>

              {/* NORMAS GENERALES - siempre visible */}
              <Accordion expanded={expanded === 'general'} onChange={handleChange('general')} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <GavelIcon color="primary" />
                    <Typography variant="h6" fontWeight={600}>{t("General Rules")}</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 1.5 }}>
                    {t("All entries must be original works created entirely by the participants. In some cases, third-party resources and tools may be used, provided their use has been authorized and properly credited in the production description.")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 1.5 }}>
                    {t("If AI tools have been used for the production, this must be explicitly stated in the accompanying readme document. In competitions where AI usage is explicitly prohibited, it remains strictly forbidden regardless of disclosure.")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 1.5 }}>
                    {t("Only works that have not been previously submitted to any other competition will be accepted. Works containing political, religious, racist, sexist, homophobic messages or inciting hatred towards any group will not be accepted.")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 1.5 }}>
                    {t("Works containing pornography or any audiovisual material deemed inappropriate by the organization for the event audience will not be accepted. Works that violate copyright will not be accepted.")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 1.5 }}>
                    {t("Submitting a work grants the organization the right to its free distribution through digital means. Disqualified works or those submitted to cancelled competitions will not be distributed.")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 1.5 }}>
                    {t("Voting will be conducted by a jury. Public voting is not permitted to prevent situations where 'funny or cute' productions (which are still welcome) win over more technically accomplished and higher quality ones.")}
                  </Typography>

                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    {t("Required Documentation (.txt file)")}
                  </Typography>
                  <List dense>
                    {[
                      t("Full name of the author(s)"),
                      t("Group(s) the authors belong to (if applicable)"),
                      t("Contact email"),
                      t("Competition category (e.g., Wild Compo)"),
                      t("Minimum machine required to run the production (if applicable)"),
                      t("List of all tools used for development"),
                      t("List of third-party resources included with links to their licenses"),
                      t("License texts that need to be included in the distribution"),
                      t("Any additional information of interest (development process, custom tools, etc.)"),
                      t("AI tools used (even partially): which tools and in which parts of the production"),
                    ].map((item, i) => (
                      <ListItem key={i} sx={{ py: 0.25 }}>
                        <ListItemIcon sx={{ minWidth: 28 }}><CheckIcon fontSize="small" color="primary" /></ListItemIcon>
                        <ListItemText primary={item} primaryTypographyProps={{ variant: 'body2' }} />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>

              {/* COMPO RULES - dinámicas desde la BD */}
              {composWithRules.map((hc) => (
                <Accordion key={hc.id} expanded={expanded === `compo-${hc.id}`} onChange={handleChange(`compo-${hc.id}`)}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <TrophyIcon color="primary" />
                      <Typography variant="h6" fontWeight={600}>{hc.compo_name}</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {hc.compo_description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                        {hc.compo_description}
                      </Typography>
                    )}
                    <SimpleMarkdown>{hc.compo_rules}</SimpleMarkdown>
                  </AccordionDetails>
                </Accordion>
              ))}

              {/* MACHINE SPECS */}
              {(needsOCS || needsAGA) && (
                <Accordion expanded={expanded === 'machines'} onChange={handleChange('machines')}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <ComputerIcon color="primary" />
                      <Typography variant="h6" fontWeight={600}>{t("Competition Machine Specifications")}</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {needsOCS && (
                      <MachineSpecsTable
                        title={t("OCS Machine")}
                        specs={[
                          [t('Model'), 'Amiga 500 PAL'],
                          [t('Processor'), 'M68000 / 7.14 MHz'],
                          ['Chipset', 'OCS'],
                          [t('Memory'), '512 KB Chip + 512 KB Slow'],
                          [t('Floppy'), t('Double density (880 KB per disk) / Gotek USB')],
                          [t('Hard drive'), t('Not available')],
                          ['Kickstart', 'v1.3'],
                        ]}
                      />
                    )}
                    {needsAGA && (
                      <MachineSpecsTable
                        title={t("AGA Machine")}
                        specs={[
                          [t('Model'), 'Amiga 1200'],
                          [t('Processor'), 'M68060 / 50 MHz'],
                          ['Chipset', 'AGA'],
                          [t('Memory'), '64 MB Fast'],
                          [t('Hard drive'), t('Available')],
                          ['Kickstart', 'v3.2+'],
                          [t('Pre-installed software'), 'SetPatch, AHI, 68060.library'],
                        ]}
                      />
                    )}
                  </AccordionDetails>
                </Accordion>
              )}

              {/* DELIVERY - siempre visible */}
              <Accordion expanded={expanded === 'delivery'} onChange={handleChange('delivery')}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <DocIcon color="primary" />
                    <Typography variant="h6" fontWeight={600}>{t("Submission Requirements")}</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 1.5 }}>
                    {t("If the production consists of multiple files (e.g., 2 ADFs, or the image with its work-in-progress steps), they must be packaged together in a compressed archive using a popular format such as LHA, LZX or ZIP.")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 1.5 }}>
                    {t("Remote participants may optionally provide their Telegram username for faster communication in case of issues or questions.")}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </>
          )}

        </Box>
      </Box>
    </Box>
  );
};

export default RulesPage;
